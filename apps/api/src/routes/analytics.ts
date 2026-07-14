import { Hono } from "hono";
import { and, eq, gte } from "drizzle-orm";
import { createDb, studioEvents } from "@mirae/db";
import { type AuthEnv } from "../auth.ts";
import { getArtist } from "../lib/session.ts";

type Bindings = AuthEnv & { ASSETS: Fetcher };

export const analyticsRoutes = new Hono<{ Bindings: Bindings }>();

const DAY = 24 * 60 * 60 * 1000;

// GET /api/analytics — privacy-friendly studio insights for the signed-in
// artist (last 30 days). Aggregated in-app from the raw events.
analyticsRoutes.get("/", async (c) => {
  const artist = await getArtist(c);
  if (!artist) return c.json({ error: "unauthorized" }, 401);

  const since = new Date(Date.now() - 30 * DAY);
  const db = createDb(c.env.DATABASE_URL);
  const rows = await db
    .select()
    .from(studioEvents)
    .where(
      and(
        eq(studioEvents.artistId, artist.id),
        gte(studioEvents.createdAt, since),
      ),
    );

  const views = rows.filter((r) => r.type === "view");
  const uniqueViews = new Set(views.map((r) => r.sessionHash).filter(Boolean))
    .size;
  const linkClicks = rows.filter((r) => r.type === "link_click").length;
  const requestStarts = rows.filter((r) => r.type === "request_start").length;
  const requestSubmits = rows.filter((r) => r.type === "request_submit").length;

  // Views per day for the last 14 days (oldest → newest).
  const dayKey = (d: Date) => d.toISOString().slice(0, 10);
  const buckets = new Map<string, number>();
  for (let i = 13; i >= 0; i--)
    buckets.set(dayKey(new Date(Date.now() - i * DAY)), 0);
  for (const v of views) {
    const k = dayKey(new Date(v.createdAt));
    if (buckets.has(k)) buckets.set(k, (buckets.get(k) ?? 0) + 1);
  }
  const byDay = [...buckets.entries()].map(([day, count]) => ({ day, count }));

  // Top referrer hosts (from views).
  const refCounts = new Map<string, number>();
  for (const v of views)
    if (v.refHost)
      refCounts.set(v.refHost, (refCounts.get(v.refHost) ?? 0) + 1);
  const topReferrers = [...refCounts.entries()]
    .map(([host, count]) => ({ host, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const conversion =
    views.length > 0
      ? Math.round((requestSubmits / views.length) * 1000) / 10
      : 0;

  return c.json({
    views: views.length,
    uniqueViews,
    linkClicks,
    requestStarts,
    requestSubmits,
    conversion, // % of views that submitted a request
    byDay,
    topReferrers,
  });
});
