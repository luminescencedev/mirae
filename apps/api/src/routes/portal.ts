import { Hono } from "hono";
import { eq } from "drizzle-orm";
import {
  activityLogs,
  artistProfiles,
  commissions,
  createDb,
  portalFeedback,
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
  });
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
