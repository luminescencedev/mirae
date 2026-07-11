import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { artistProfiles, commissions, createDb, quotes } from "@mirae/db";
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

  const [artist] = await db
    .select({
      displayName: artistProfiles.displayName,
      handle: artistProfiles.handle,
    })
    .from(artistProfiles)
    .where(eq(artistProfiles.id, commission.artistId))
    .limit(1);

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
