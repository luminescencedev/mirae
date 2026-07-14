import { Hono } from "hono";
import { and, asc, desc, eq, inArray } from "drizzle-orm";
import {
  activityLogs,
  commissionRequests,
  commissionStatus,
  commissions,
  createDb,
  deliveries,
  files,
  portalMessages,
  portalThreads,
  quoteItems,
  quotes,
  revisionRounds,
} from "@mirae/db";
import { type AuthEnv } from "../auth.ts";
import { getArtist } from "../lib/session.ts";
import { mailLayout, sendEmail } from "../lib/mail.ts";

type Bindings = AuthEnv & { ASSETS: Fetcher; FILES: R2Bucket };

// The client email + portal token for a commission (from its originating
// request), for notification emails.
async function clientInfoFor(
  db: ReturnType<typeof createDb>,
  commissionId: string,
): Promise<{ email: string | null; portalToken: string | null }> {
  const [row] = await db
    .select({
      email: commissionRequests.clientEmail,
      portalToken: commissions.portalToken,
    })
    .from(commissions)
    .leftJoin(
      commissionRequests,
      eq(commissionRequests.id, commissions.requestId),
    )
    .where(eq(commissions.id, commissionId))
    .limit(1);
  return { email: row?.email ?? null, portalToken: row?.portalToken ?? null };
}

export const commissionsRoutes = new Hono<{ Bindings: Bindings }>();

type CommissionStatus = (typeof commissionStatus.enumValues)[number];

function isStatus(v: unknown): v is CommissionStatus {
  return (
    typeof v === "string" &&
    (commissionStatus.enumValues as readonly string[]).includes(v)
  );
}

type Body = {
  title?: unknown;
  status?: unknown;
  priceCents?: unknown;
  paidCents?: unknown;
  deadline?: unknown;
  requestId?: unknown;
  clientId?: unknown;
};

// Normalize an incoming payload to the columns we accept.
function parse(body: Body) {
  const out: {
    title?: string;
    status?: CommissionStatus;
    priceCents?: number | null;
    paidCents?: number;
    deadline?: Date | null;
  } = {};
  if (typeof body.title === "string") out.title = body.title.trim();
  if (isStatus(body.status)) out.status = body.status;
  if ("priceCents" in body)
    out.priceCents = body.priceCents == null ? null : Number(body.priceCents);
  if (body.paidCents != null) out.paidCents = Number(body.paidCents);
  if ("deadline" in body)
    out.deadline = body.deadline ? new Date(String(body.deadline)) : null;
  return out;
}

// GET /api/commissions — the artist's commissions for the queue, newest
// first, enriched with the originating request's client name/email.
commissionsRoutes.get("/", async (c) => {
  const artist = await getArtist(c);
  if (!artist) return c.json({ error: "unauthorized" }, 401);
  const db = createDb(c.env.DATABASE_URL);
  const rows = await db
    .select({
      id: commissions.id,
      title: commissions.title,
      status: commissions.status,
      priceCents: commissions.priceCents,
      paidCents: commissions.paidCents,
      deadline: commissions.deadline,
      requestId: commissions.requestId,
      portalToken: commissions.portalToken,
      createdAt: commissions.createdAt,
      updatedAt: commissions.updatedAt,
      clientName: commissionRequests.clientName,
      clientEmail: commissionRequests.clientEmail,
    })
    .from(commissions)
    .leftJoin(
      commissionRequests,
      eq(commissionRequests.id, commissions.requestId),
    )
    .where(eq(commissions.artistId, artist.id))
    .orderBy(desc(commissions.createdAt));
  return c.json({ commissions: rows });
});

// POST /api/commissions — create a commission directly.
commissionsRoutes.post("/", async (c) => {
  const artist = await getArtist(c);
  if (!artist) return c.json({ error: "unauthorized" }, 401);
  const body = (await c.req.json().catch(() => ({}))) as Body;
  if (body.status !== undefined && !isStatus(body.status))
    return c.json({ error: "Invalid status." }, 400);
  const data = parse(body);
  if (!data.title) return c.json({ error: "Title is required." }, 400);
  const db = createDb(c.env.DATABASE_URL);
  const [row] = await db
    .insert(commissions)
    .values({
      ...data,
      title: data.title,
      artistId: artist.id,
      requestId: typeof body.requestId === "string" ? body.requestId : null,
      clientId: typeof body.clientId === "string" ? body.clientId : null,
    })
    .returning();
  return c.json({ commission: row }, 201);
});

// PATCH /api/commissions/:id
commissionsRoutes.patch("/:id", async (c) => {
  const artist = await getArtist(c);
  if (!artist) return c.json({ error: "unauthorized" }, 401);
  const body = (await c.req.json().catch(() => ({}))) as Body;
  if (body.status !== undefined && !isStatus(body.status))
    return c.json({ error: "Invalid status." }, 400);
  const data = parse(body);
  const db = createDb(c.env.DATABASE_URL);
  const [row] = await db
    .update(commissions)
    .set(data)
    .where(
      and(
        eq(commissions.id, c.req.param("id")),
        eq(commissions.artistId, artist.id),
      ),
    )
    .returning();
  if (!row) return c.json({ error: "not found" }, 404);

  // Log status transitions + payment updates to the activity feed.
  if (data.status !== undefined) {
    await db.insert(activityLogs).values({
      artistId: artist.id,
      commissionId: row.id,
      type: "status",
      message: `Status changed to ${data.status}`,
    });
  }
  if (data.paidCents !== undefined) {
    await db.insert(activityLogs).values({
      artistId: artist.id,
      commissionId: row.id,
      type: "payment",
      message: `Payment recorded: ${(data.paidCents / 100).toLocaleString()} €`,
    });
  }
  return c.json({ commission: row });
});

// GET /api/commissions/:id/activity — the activity feed for a commission.
commissionsRoutes.get("/:id/activity", async (c) => {
  const artist = await getArtist(c);
  if (!artist) return c.json({ error: "unauthorized" }, 401);
  const db = createDb(c.env.DATABASE_URL);
  const rows = await db
    .select({
      id: activityLogs.id,
      type: activityLogs.type,
      message: activityLogs.message,
      createdAt: activityLogs.createdAt,
    })
    .from(activityLogs)
    .where(
      and(
        eq(activityLogs.commissionId, c.req.param("id")),
        eq(activityLogs.artistId, artist.id),
      ),
    )
    .orderBy(desc(activityLogs.createdAt));
  return c.json({ activity: rows });
});

// POST /api/commissions/:id/portal — ensure the commission has a client
// portal token; returns it (idempotent — reuses an existing token).
commissionsRoutes.post("/:id/portal", async (c) => {
  const artist = await getArtist(c);
  if (!artist) return c.json({ error: "unauthorized" }, 401);
  const db = createDb(c.env.DATABASE_URL);
  const [row] = await db
    .select({ id: commissions.id, portalToken: commissions.portalToken })
    .from(commissions)
    .where(
      and(
        eq(commissions.id, c.req.param("id")),
        eq(commissions.artistId, artist.id),
      ),
    )
    .limit(1);
  if (!row) return c.json({ error: "not found" }, 404);

  let token = row.portalToken;
  if (!token) {
    token = crypto.randomUUID().replace(/-/g, "");
    await db
      .update(commissions)
      .set({ portalToken: token })
      .where(eq(commissions.id, row.id));
  }
  return c.json({ token });
});

// --- Delivery (one per commission) ----------------------------------------

// GET /api/commissions/:id/delivery — the delivery row (or null).
commissionsRoutes.get("/:id/delivery", async (c) => {
  const artist = await getArtist(c);
  if (!artist) return c.json({ error: "unauthorized" }, 401);
  const db = createDb(c.env.DATABASE_URL);
  const commissionId = await ownedCommissionId(
    db,
    c.req.param("id"),
    artist.id,
  );
  if (!commissionId) return c.json({ error: "not found" }, 404);
  const [row] = await db
    .select()
    .from(deliveries)
    .where(eq(deliveries.commissionId, commissionId))
    .limit(1);
  return c.json({ delivery: row ?? null });
});

// POST /api/commissions/:id/delivery — ensure a delivery exists; optionally
// set the message. Idempotent (reuses the existing delivery + token).
commissionsRoutes.post("/:id/delivery", async (c) => {
  const artist = await getArtist(c);
  if (!artist) return c.json({ error: "unauthorized" }, 401);
  const db = createDb(c.env.DATABASE_URL);
  const commissionId = await ownedCommissionId(
    db,
    c.req.param("id"),
    artist.id,
  );
  if (!commissionId) return c.json({ error: "not found" }, 404);

  const body = (await c.req.json().catch(() => ({}))) as { message?: unknown };
  const message =
    typeof body.message === "string" ? body.message.trim() || null : undefined;

  const [existing] = await db
    .select()
    .from(deliveries)
    .where(eq(deliveries.commissionId, commissionId))
    .limit(1);

  if (existing) {
    if (message !== undefined) {
      const [row] = await db
        .update(deliveries)
        .set({ message })
        .where(eq(deliveries.id, existing.id))
        .returning();
      return c.json({ delivery: row });
    }
    return c.json({ delivery: existing });
  }

  const token = crypto.randomUUID().replace(/-/g, "");
  const [row] = await db
    .insert(deliveries)
    .values({ commissionId, token, message: message ?? null })
    .returning();
  return c.json({ delivery: row }, 201);
});

// POST /api/commissions/:id/delivery/deliver — mark delivered: stamp the
// delivery, move the commission to "delivered", log activity.
commissionsRoutes.post("/:id/delivery/deliver", async (c) => {
  const artist = await getArtist(c);
  if (!artist) return c.json({ error: "unauthorized" }, 401);
  const db = createDb(c.env.DATABASE_URL);
  const commissionId = await ownedCommissionId(
    db,
    c.req.param("id"),
    artist.id,
  );
  if (!commissionId) return c.json({ error: "not found" }, 404);

  const [delivery] = await db
    .select()
    .from(deliveries)
    .where(eq(deliveries.commissionId, commissionId))
    .limit(1);
  if (!delivery) return c.json({ error: "Prepare a delivery first." }, 400);

  const [updated] = await db
    .update(deliveries)
    .set({ deliveredAt: new Date() })
    .where(eq(deliveries.id, delivery.id))
    .returning();
  await db
    .update(commissions)
    .set({ status: "delivered" })
    .where(eq(commissions.id, commissionId));
  await db.insert(activityLogs).values({
    artistId: artist.id,
    commissionId,
    type: "delivery",
    message: "Marked as delivered",
  });

  // Notify the client their delivery is ready (best-effort).
  const { email: deliverEmail } = await clientInfoFor(db, commissionId);
  if (deliverEmail) {
    await sendEmail(c.env, {
      to: deliverEmail,
      subject: "Your commission is ready",
      html: mailLayout(
        "Your commission is ready",
        "Your artist has marked your commission as delivered. Open your delivery page to download the files.",
        {
          label: "View delivery",
          url: `https://usemirae.com/delivery/${updated.token}`,
        },
      ),
    });
  }
  return c.json({ delivery: updated });
});

// --- Files (deliverables in R2) -------------------------------------------

// GET /api/commissions/:id/files — the commission's files.
commissionsRoutes.get("/:id/files", async (c) => {
  const artist = await getArtist(c);
  if (!artist) return c.json({ error: "unauthorized" }, 401);
  const db = createDb(c.env.DATABASE_URL);
  const commissionId = await ownedCommissionId(
    db,
    c.req.param("id"),
    artist.id,
  );
  if (!commissionId) return c.json({ error: "not found" }, 404);
  const rows = await db
    .select({
      id: files.id,
      name: files.name,
      sizeBytes: files.sizeBytes,
      kind: files.kind,
      createdAt: files.createdAt,
    })
    .from(files)
    .where(eq(files.commissionId, commissionId))
    .orderBy(desc(files.createdAt));
  return c.json({ files: rows });
});

// POST /api/commissions/:id/files — upload a deliverable to R2 (multipart).
commissionsRoutes.post("/:id/files", async (c) => {
  const artist = await getArtist(c);
  if (!artist) return c.json({ error: "unauthorized" }, 401);
  const db = createDb(c.env.DATABASE_URL);
  const commissionId = await ownedCommissionId(
    db,
    c.req.param("id"),
    artist.id,
  );
  if (!commissionId) return c.json({ error: "not found" }, 404);

  const form = await c.req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return c.json({ error: "No file." }, 400);

  const key = `commissions/${commissionId}/${crypto.randomUUID()}-${file.name}`;
  await c.env.FILES.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type || "application/octet-stream" },
  });
  const [row] = await db
    .insert(files)
    .values({
      commissionId,
      kind: "deliverable",
      key,
      name: file.name,
      sizeBytes: file.size,
    })
    .returning({
      id: files.id,
      name: files.name,
      sizeBytes: files.sizeBytes,
      kind: files.kind,
      createdAt: files.createdAt,
    });
  return c.json({ file: row }, 201);
});

// DELETE /api/commissions/:id/files/:fileId — remove a file (R2 + row).
commissionsRoutes.delete("/:id/files/:fileId", async (c) => {
  const artist = await getArtist(c);
  if (!artist) return c.json({ error: "unauthorized" }, 401);
  const db = createDb(c.env.DATABASE_URL);
  const commissionId = await ownedCommissionId(
    db,
    c.req.param("id"),
    artist.id,
  );
  if (!commissionId) return c.json({ error: "not found" }, 404);
  const [row] = await db
    .select({ id: files.id, key: files.key })
    .from(files)
    .where(
      and(
        eq(files.id, c.req.param("fileId")),
        eq(files.commissionId, commissionId),
      ),
    )
    .limit(1);
  if (!row) return c.json({ error: "not found" }, 404);
  await c.env.FILES.delete(row.key);
  await db.delete(files).where(eq(files.id, row.id));
  return c.json({ ok: true });
});

// --- Quotes (one per commission) -----------------------------------------

type QuoteItemInput = {
  label?: unknown;
  amountCents?: unknown;
  quantity?: unknown;
};

// Verify the commission belongs to the signed-in artist; returns its id or null.
async function ownedCommissionId(
  db: ReturnType<typeof createDb>,
  commissionId: string,
  artistId: string,
): Promise<string | null> {
  const [row] = await db
    .select({ id: commissions.id })
    .from(commissions)
    .where(
      and(eq(commissions.id, commissionId), eq(commissions.artistId, artistId)),
    )
    .limit(1);
  return row?.id ?? null;
}

// GET /api/commissions/:id/threads — feedback threads + revisions (owner).
commissionsRoutes.get("/:id/threads", async (c) => {
  const artist = await getArtist(c);
  if (!artist) return c.json({ error: "unauthorized" }, 401);
  const db = createDb(c.env.DATABASE_URL);
  const commissionId = await ownedCommissionId(
    db,
    c.req.param("id"),
    artist.id,
  );
  if (!commissionId) return c.json({ error: "not found" }, 404);

  const threadRows = await db
    .select()
    .from(portalThreads)
    .where(eq(portalThreads.commissionId, commissionId))
    .orderBy(desc(portalThreads.updatedAt));
  const msgs = threadRows.length
    ? await db
        .select()
        .from(portalMessages)
        .where(
          inArray(
            portalMessages.threadId,
            threadRows.map((t) => t.id),
          ),
        )
        .orderBy(asc(portalMessages.createdAt))
    : [];
  const rounds = await db
    .select()
    .from(revisionRounds)
    .where(eq(revisionRounds.commissionId, commissionId))
    .orderBy(asc(revisionRounds.roundNumber));

  return c.json({
    threads: threadRows.map((t) => ({
      id: t.id,
      subject: t.subject,
      status: t.status,
      createdAt: t.createdAt,
      messages: msgs
        .filter((m) => m.threadId === t.id)
        .map((m) => ({
          id: m.id,
          authorRole: m.authorRole,
          body: m.body,
          createdAt: m.createdAt,
        })),
    })),
    revisions: rounds.map((r) => ({
      id: r.id,
      roundNumber: r.roundNumber,
      status: r.status,
      note: r.note,
      createdAt: r.createdAt,
    })),
  });
});

// POST /api/commissions/:id/threads/:threadId/messages — artist reply (owner).
commissionsRoutes.post("/:id/threads/:threadId/messages", async (c) => {
  const artist = await getArtist(c);
  if (!artist) return c.json({ error: "unauthorized" }, 401);
  const db = createDb(c.env.DATABASE_URL);
  const commissionId = await ownedCommissionId(
    db,
    c.req.param("id"),
    artist.id,
  );
  if (!commissionId) return c.json({ error: "not found" }, 404);

  const threadId = c.req.param("threadId");
  const [thread] = await db
    .select({ id: portalThreads.id })
    .from(portalThreads)
    .where(
      and(
        eq(portalThreads.id, threadId),
        eq(portalThreads.commissionId, commissionId),
      ),
    )
    .limit(1);
  if (!thread) return c.json({ error: "not found" }, 404);

  const raw = (await c.req.json().catch(() => ({}))) as { body?: unknown };
  const message = String(raw.body ?? "").trim();
  if (!message) return c.json({ error: "Message is required." }, 400);

  await db
    .insert(portalMessages)
    .values({ threadId, authorRole: "artist", body: message });
  await db
    .update(portalThreads)
    .set({ updatedAt: new Date() })
    .where(eq(portalThreads.id, threadId));
  return c.json({ ok: true }, 201);
});

// GET /api/commissions/:id/quote — the commission's quote + line items (or null).
commissionsRoutes.get("/:id/quote", async (c) => {
  const artist = await getArtist(c);
  if (!artist) return c.json({ error: "unauthorized" }, 401);
  const db = createDb(c.env.DATABASE_URL);
  const commissionId = await ownedCommissionId(
    db,
    c.req.param("id"),
    artist.id,
  );
  if (!commissionId) return c.json({ error: "not found" }, 404);

  const [quote] = await db
    .select()
    .from(quotes)
    .where(eq(quotes.commissionId, commissionId))
    .limit(1);
  if (!quote) return c.json({ quote: null });

  const items = await db
    .select()
    .from(quoteItems)
    .where(eq(quoteItems.quoteId, quote.id));
  return c.json({ quote: { ...quote, items } });
});

// PUT /api/commissions/:id/quote — create/replace the draft quote + items.
// Recomputes the total and mirrors it onto the commission's price.
commissionsRoutes.put("/:id/quote", async (c) => {
  const artist = await getArtist(c);
  if (!artist) return c.json({ error: "unauthorized" }, 401);
  const db = createDb(c.env.DATABASE_URL);
  const commissionId = await ownedCommissionId(
    db,
    c.req.param("id"),
    artist.id,
  );
  if (!commissionId) return c.json({ error: "not found" }, 404);

  const body = (await c.req.json().catch(() => ({}))) as { items?: unknown };
  const rawItems = Array.isArray(body.items)
    ? (body.items as QuoteItemInput[])
    : [];
  const items = rawItems
    .map((it) => ({
      label: String(it.label ?? "").trim(),
      amountCents: Number(it.amountCents) || 0,
      quantity: Math.max(1, Number(it.quantity) || 1),
    }))
    .filter((it) => it.label);
  const totalCents = items.reduce(
    (s, it) => s + it.amountCents * it.quantity,
    0,
  );

  // Upsert the quote row (kept as draft on edit).
  const [existing] = await db
    .select()
    .from(quotes)
    .where(eq(quotes.commissionId, commissionId))
    .limit(1);
  let quoteId: string;
  if (existing) {
    quoteId = existing.id;
    await db.update(quotes).set({ totalCents }).where(eq(quotes.id, quoteId));
    await db.delete(quoteItems).where(eq(quoteItems.quoteId, quoteId));
  } else {
    const [created] = await db
      .insert(quotes)
      .values({ commissionId, totalCents, status: "draft" })
      .returning({ id: quotes.id });
    quoteId = created.id;
  }
  if (items.length)
    await db.insert(quoteItems).values(items.map((it) => ({ ...it, quoteId })));

  // Mirror the total onto the commission price.
  await db
    .update(commissions)
    .set({ priceCents: totalCents })
    .where(eq(commissions.id, commissionId));

  const saved = await db
    .select()
    .from(quoteItems)
    .where(eq(quoteItems.quoteId, quoteId));
  return c.json({
    quote: {
      id: quoteId,
      commissionId,
      totalCents,
      status: existing?.status ?? "draft",
      items: saved,
    },
  });
});

// POST /api/commissions/:id/quote/send — mark the quote sent (placeholder:
// no email yet) and bump the commission to "quote_sent".
commissionsRoutes.post("/:id/quote/send", async (c) => {
  const artist = await getArtist(c);
  if (!artist) return c.json({ error: "unauthorized" }, 401);
  const db = createDb(c.env.DATABASE_URL);
  const commissionId = await ownedCommissionId(
    db,
    c.req.param("id"),
    artist.id,
  );
  if (!commissionId) return c.json({ error: "not found" }, 404);

  const [quote] = await db
    .select()
    .from(quotes)
    .where(eq(quotes.commissionId, commissionId))
    .limit(1);
  if (!quote) return c.json({ error: "No quote to send." }, 400);

  const [updated] = await db
    .update(quotes)
    .set({ status: "sent", sentAt: new Date() })
    .where(eq(quotes.id, quote.id))
    .returning();

  await db
    .update(commissions)
    .set({ status: "quote_sent" })
    .where(eq(commissions.id, commissionId));

  await db.insert(activityLogs).values({
    artistId: artist.id,
    commissionId,
    type: "quote",
    message: `Quote sent (${(updated.totalCents / 100).toLocaleString()} €)`,
  });

  const items = await db
    .select()
    .from(quoteItems)
    .where(eq(quoteItems.quoteId, quote.id));

  // Notify the client a quote is waiting (best-effort).
  const { email: quoteEmail, portalToken } = await clientInfoFor(
    db,
    commissionId,
  );
  if (quoteEmail) {
    await sendEmail(c.env, {
      to: quoteEmail,
      subject: "You've received a quote",
      html: mailLayout(
        "You've received a quote",
        `Your artist sent a quote of <strong>${(updated.totalCents / 100).toLocaleString()} €</strong>. Open your portal to review it.`,
        portalToken
          ? {
              label: "View quote",
              url: `https://usemirae.com/portal/${portalToken}`,
            }
          : undefined,
      ),
    });
  }
  return c.json({ quote: { ...updated, items } });
});

// DELETE /api/commissions/:id
commissionsRoutes.delete("/:id", async (c) => {
  const artist = await getArtist(c);
  if (!artist) return c.json({ error: "unauthorized" }, 401);
  const db = createDb(c.env.DATABASE_URL);
  const [row] = await db
    .delete(commissions)
    .where(
      and(
        eq(commissions.id, c.req.param("id")),
        eq(commissions.artistId, artist.id),
      ),
    )
    .returning({ id: commissions.id });
  if (!row) return c.json({ error: "not found" }, 404);
  return c.json({ ok: true });
});
