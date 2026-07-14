import { Hono } from "hono";
import { and, asc, eq, inArray } from "drizzle-orm";
import {
  activityLogs,
  artistProfiles,
  commissions,
  createDb,
  portalFeedback,
  portalMessages,
  portalThreads,
  quotes,
} from "@mirae/db";
import { type AuthEnv } from "../auth.ts";

type Bindings = AuthEnv & { ASSETS: Fetcher };

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
    .select({ totalCents: quotes.totalCents, status: quotes.status })
    .from(quotes)
    .where(eq(quotes.commissionId, commission.id))
    .limit(1);

  const threads = await loadThreads(db, commission.id);

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
  });
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
