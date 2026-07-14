import { Hono } from "hono";
import { and, asc, eq, inArray } from "drizzle-orm";
import {
  activityLogs,
  artistProfiles,
  commissions,
  createDb,
  files,
  portalFeedback,
  portalMessages,
  portalThreads,
  quotes,
  revisionRounds,
} from "@mirae/db";
import { type AuthEnv } from "../auth.ts";

type Bindings = AuthEnv & { ASSETS: Fetcher; FILES: R2Bucket };

export const portalRoutes = new Hono<{ Bindings: Bindings }>();

// GET /api/portal/:token — the PUBLIC client view of a commission (no auth).
// Token-addressed; returns safe fields only.
portalRoutes.get("/:token", async (c) => {
  const token = c.req.param("token");
  const db = createDb(c.env.DATABASE_URL);

  const [commission] = await db
    .select()
    .from(commissions)
    .where(eq(commissions.portalToken, token))
    .limit(1);
  if (!commission) return c.json({ error: "not found" }, 404);

  const [artistRow] = await db
    .select({
      displayName: artistProfiles.displayName,
      handle: artistProfiles.handle,
      tagline: artistProfiles.tagline,
      avatarR2Key: artistProfiles.avatarR2Key,
      coverR2Key: artistProfiles.coverR2Key,
    })
    .from(artistProfiles)
    .where(eq(artistProfiles.id, commission.artistId))
    .limit(1);
  const artist = artistRow
    ? {
        displayName: artistRow.displayName,
        handle: artistRow.handle,
        tagline: artistRow.tagline,
        hasAvatar: !!artistRow.avatarR2Key,
        hasCover: !!artistRow.coverR2Key,
      }
    : null;

  const [quote] = await db
    .select({
      totalCents: quotes.totalCents,
      status: quotes.status,
      declineReason: quotes.declineReason,
    })
    .from(quotes)
    .where(eq(quotes.commissionId, commission.id))
    .limit(1);

  const threads = await loadThreads(db, commission.id);

  const rounds = await db
    .select()
    .from(revisionRounds)
    .where(eq(revisionRounds.commissionId, commission.id))
    .orderBy(asc(revisionRounds.roundNumber));

  const references = await db
    .select({
      id: files.id,
      name: files.name,
      sizeBytes: files.sizeBytes,
    })
    .from(files)
    .where(
      and(eq(files.commissionId, commission.id), eq(files.kind, "reference")),
    );

  return c.json({
    commission: {
      title: commission.title,
      status: commission.status,
      deadline: commission.deadline,
      priceCents: commission.priceCents,
      paidCents: commission.paidCents,
    },
    artist: artist ?? null,
    quote: quote ?? null,
    threads,
    revisions: {
      allowed: commission.revisionsAllowed,
      used: rounds.length,
      rounds: rounds.map((r) => ({
        id: r.id,
        roundNumber: r.roundNumber,
        status: r.status,
        note: r.note,
        createdAt: r.createdAt,
      })),
    },
    references,
  });
});

// GET /api/portal/:token/files/:fileId — stream a reference file from R2,
// gated by the portal token (reference kind only — deliverables use the
// delivery token).
portalRoutes.get("/:token/files/:fileId", async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const [commission] = await db
    .select({ id: commissions.id })
    .from(commissions)
    .where(eq(commissions.portalToken, c.req.param("token")))
    .limit(1);
  if (!commission) return c.json({ error: "not found" }, 404);

  const [file] = await db
    .select()
    .from(files)
    .where(
      and(
        eq(files.id, c.req.param("fileId")),
        eq(files.commissionId, commission.id),
        eq(files.kind, "reference"),
      ),
    )
    .limit(1);
  if (!file) return c.json({ error: "not found" }, 404);

  const object = await c.env.FILES.get(file.key);
  if (!object) return c.json({ error: "not found" }, 404);
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  return new Response(object.body, { headers });
});

// POST /api/portal/:token/quote/accept — client accepts the sent quote.
portalRoutes.post("/:token/quote/accept", async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const [commission] = await db
    .select({ id: commissions.id, artistId: commissions.artistId })
    .from(commissions)
    .where(eq(commissions.portalToken, c.req.param("token")))
    .limit(1);
  if (!commission) return c.json({ error: "not found" }, 404);

  const [quote] = await db
    .select({ id: quotes.id, status: quotes.status })
    .from(quotes)
    .where(eq(quotes.commissionId, commission.id))
    .limit(1);
  if (!quote) return c.json({ error: "No quote to accept." }, 404);
  if (quote.status !== "sent")
    return c.json({ error: "This quote can't be accepted." }, 409);

  await db
    .update(quotes)
    .set({ status: "accepted", respondedAt: new Date() })
    .where(eq(quotes.id, quote.id));
  await db.insert(activityLogs).values({
    artistId: commission.artistId,
    commissionId: commission.id,
    type: "quote",
    message: "Client accepted the quote",
  });
  return c.json({ ok: true });
});

// POST /api/portal/:token/quote/decline — client declines the sent quote.
portalRoutes.post("/:token/quote/decline", async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const [commission] = await db
    .select({ id: commissions.id, artistId: commissions.artistId })
    .from(commissions)
    .where(eq(commissions.portalToken, c.req.param("token")))
    .limit(1);
  if (!commission) return c.json({ error: "not found" }, 404);

  const [quote] = await db
    .select({ id: quotes.id, status: quotes.status })
    .from(quotes)
    .where(eq(quotes.commissionId, commission.id))
    .limit(1);
  if (!quote) return c.json({ error: "No quote to decline." }, 404);
  if (quote.status !== "sent")
    return c.json({ error: "This quote can't be declined." }, 409);

  const raw = (await c.req.json().catch(() => ({}))) as { reason?: unknown };
  const reason = String(raw.reason ?? "").trim() || null;

  await db
    .update(quotes)
    .set({ status: "declined", respondedAt: new Date(), declineReason: reason })
    .where(eq(quotes.id, quote.id));
  await db.insert(activityLogs).values({
    artistId: commission.artistId,
    commissionId: commission.id,
    type: "quote",
    message: `Client declined the quote${reason ? `: ${reason}` : ""}`,
  });
  return c.json({ ok: true });
});

// POST /api/portal/:token/revisions — client requests a revision round.
portalRoutes.post("/:token/revisions", async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const [commission] = await db
    .select({
      id: commissions.id,
      artistId: commissions.artistId,
      revisionsAllowed: commissions.revisionsAllowed,
    })
    .from(commissions)
    .where(eq(commissions.portalToken, c.req.param("token")))
    .limit(1);
  if (!commission) return c.json({ error: "not found" }, 404);

  const used = (
    await db
      .select({ id: revisionRounds.id })
      .from(revisionRounds)
      .where(eq(revisionRounds.commissionId, commission.id))
  ).length;
  if (commission.revisionsAllowed > 0 && used >= commission.revisionsAllowed)
    return c.json({ error: "No revision rounds remaining." }, 409);

  const raw = (await c.req.json().catch(() => ({}))) as { note?: unknown };
  const note = String(raw.note ?? "").trim() || null;

  await db.insert(revisionRounds).values({
    commissionId: commission.id,
    roundNumber: used + 1,
    status: "requested",
    note,
  });
  await db.insert(activityLogs).values({
    artistId: commission.artistId,
    commissionId: commission.id,
    type: "revision",
    message: `Client requested revision #${used + 1}${note ? `: ${note}` : ""}`,
  });
  return c.json({ ok: true }, 201);
});

// Load a commission's feedback threads with their ordered messages.
async function loadThreads(
  db: ReturnType<typeof createDb>,
  commissionId: string,
) {
  const rows = await db
    .select()
    .from(portalThreads)
    .where(eq(portalThreads.commissionId, commissionId))
    .orderBy(asc(portalThreads.createdAt));
  if (rows.length === 0) return [];
  const msgs = await db
    .select()
    .from(portalMessages)
    .where(
      inArray(
        portalMessages.threadId,
        rows.map((t) => t.id),
      ),
    )
    .orderBy(asc(portalMessages.createdAt));
  return rows.map((t) => ({
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
  }));
}

// POST /api/portal/:token/threads — client opens a new feedback thread.
portalRoutes.post("/:token/threads", async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const [commission] = await db
    .select({ id: commissions.id, artistId: commissions.artistId })
    .from(commissions)
    .where(eq(commissions.portalToken, c.req.param("token")))
    .limit(1);
  if (!commission) return c.json({ error: "not found" }, 404);

  const body = (await c.req.json().catch(() => ({}))) as {
    subject?: unknown;
    body?: unknown;
  };
  const subject = String(body.subject ?? "").trim() || null;
  const message = String(body.body ?? "").trim();
  if (!message) return c.json({ error: "Message is required." }, 400);

  const [thread] = await db
    .insert(portalThreads)
    .values({ commissionId: commission.id, subject })
    .returning();
  await db.insert(portalMessages).values({
    threadId: thread.id,
    authorRole: "client",
    body: message,
  });
  await db.insert(activityLogs).values({
    artistId: commission.artistId,
    commissionId: commission.id,
    type: "feedback",
    message: `New client thread${subject ? `: ${subject}` : ""}`,
  });
  return c.json({ ok: true, threadId: thread.id }, 201);
});

// POST /api/portal/:token/threads/:threadId/messages — client replies.
portalRoutes.post("/:token/threads/:threadId/messages", async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const [commission] = await db
    .select({ id: commissions.id, artistId: commissions.artistId })
    .from(commissions)
    .where(eq(commissions.portalToken, c.req.param("token")))
    .limit(1);
  if (!commission) return c.json({ error: "not found" }, 404);

  const threadId = c.req.param("threadId");
  const [thread] = await db
    .select({ id: portalThreads.id })
    .from(portalThreads)
    .where(
      and(
        eq(portalThreads.id, threadId),
        eq(portalThreads.commissionId, commission.id),
      ),
    )
    .limit(1);
  if (!thread) return c.json({ error: "not found" }, 404);

  const raw = (await c.req.json().catch(() => ({}))) as { body?: unknown };
  const message = String(raw.body ?? "").trim();
  if (!message) return c.json({ error: "Message is required." }, 400);

  await db
    .insert(portalMessages)
    .values({ threadId, authorRole: "client", body: message });
  // Touch the thread + reopen if it had been resolved.
  await db
    .update(portalThreads)
    .set({ status: "open" })
    .where(eq(portalThreads.id, threadId));
  await db.insert(activityLogs).values({
    artistId: commission.artistId,
    commissionId: commission.id,
    type: "feedback",
    message: `Client replied to a thread`,
  });
  return c.json({ ok: true }, 201);
});

// POST /api/portal/:token/feedback — a client note from the portal (public).
// Persists it and drops a note into the artist's activity feed.
portalRoutes.post("/:token/feedback", async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const [commission] = await db
    .select({ id: commissions.id, artistId: commissions.artistId })
    .from(commissions)
    .where(eq(commissions.portalToken, c.req.param("token")))
    .limit(1);
  if (!commission) return c.json({ error: "not found" }, 404);

  const body = (await c.req.json().catch(() => ({}))) as { message?: unknown };
  const message = String(body.message ?? "").trim();
  if (!message) return c.json({ error: "Message is required." }, 400);

  await db
    .insert(portalFeedback)
    .values({ commissionId: commission.id, message });
  await db.insert(activityLogs).values({
    artistId: commission.artistId,
    commissionId: commission.id,
    type: "feedback",
    message: `Client note: ${message.length > 80 ? message.slice(0, 77) + "…" : message}`,
  });
  return c.json({ ok: true }, 201);
});
