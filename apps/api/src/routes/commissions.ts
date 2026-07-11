import { Hono } from "hono";
import { and, desc, eq } from "drizzle-orm";
import {
  activityLogs,
  commissionRequests,
  commissionStatus,
  commissions,
  createDb,
  quoteItems,
  quotes,
} from "@mirae/db";
import { type AuthEnv } from "../auth.ts";
import { getArtist } from "../lib/session.ts";

type Bindings = AuthEnv & { ASSETS: Fetcher };

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

  // Log status transitions to the activity feed.
  if (data.status !== undefined) {
    await db.insert(activityLogs).values({
      artistId: artist.id,
      commissionId: row.id,
      type: "status",
      message: `Status changed to ${data.status}`,
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
