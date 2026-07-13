import { Hono } from "hono";
import { and, asc, eq, sql } from "drizzle-orm";
import { artistLinks, createDb, type Database } from "@mirae/db";
import { LINK_STYLES, LINK_TYPES } from "@mirae/shared";
import { type AuthEnv } from "../auth.ts";
import { getArtist } from "../lib/session.ts";

type Bindings = AuthEnv & { ASSETS: Fetcher };

export const linksRoutes = new Hono<{ Bindings: Bindings }>();

// Normalize a link URL: accept bare domains (add https://) and emails
// (mailto:). Returns null if it can't be made into a valid URL.
function normalizeUrl(raw: unknown): string | null {
  let u = String(raw ?? "").trim();
  if (!u) return null;
  const looksEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(u);
  if (looksEmail) return `mailto:${u}`;
  if (!/^(https?:|mailto:)/i.test(u)) u = `https://${u}`;
  try {
    return new URL(u).toString();
  } catch {
    return null;
  }
}

function parse(body: Record<string, unknown>) {
  const out: Partial<typeof artistLinks.$inferInsert> = {};
  if (typeof body.title === "string") out.title = body.title.trim();
  if ("url" in body) {
    const url = normalizeUrl(body.url);
    if (url) out.url = url;
  }
  if ("platform" in body)
    out.platform = body.platform ? String(body.platform) : null;
  if (
    typeof body.type === "string" &&
    (LINK_TYPES as readonly string[]).includes(body.type)
  )
    out.type = body.type as (typeof LINK_TYPES)[number];
  if (
    typeof body.style === "string" &&
    (LINK_STYLES as readonly string[]).includes(body.style)
  )
    out.style = body.style as (typeof LINK_STYLES)[number];
  if (typeof body.featured === "boolean") out.featured = body.featured;
  if (typeof body.enabled === "boolean") out.enabled = body.enabled;
  return out;
}

async function ownedLinkId(db: Database, id: string, artistId: string) {
  const [row] = await db
    .select({ id: artistLinks.id })
    .from(artistLinks)
    .where(and(eq(artistLinks.id, id), eq(artistLinks.artistId, artistId)));
  return row?.id ?? null;
}

// GET /api/artist-links — the artist's links, ordered.
linksRoutes.get("/", async (c) => {
  const artist = await getArtist(c);
  if (!artist) return c.json({ error: "unauthorized" }, 401);
  const db = createDb(c.env.DATABASE_URL);
  const rows = await db
    .select()
    .from(artistLinks)
    .where(eq(artistLinks.artistId, artist.id))
    .orderBy(asc(artistLinks.position));
  return c.json({ links: rows });
});

// POST /api/artist-links
linksRoutes.post("/", async (c) => {
  const artist = await getArtist(c);
  if (!artist) return c.json({ error: "unauthorized" }, 401);
  const data = parse((await c.req.json().catch(() => ({}))) as never);
  if (!data.title) return c.json({ error: "Title is required." }, 400);
  if (!data.url) return c.json({ error: "A valid URL is required." }, 400);
  const db = createDb(c.env.DATABASE_URL);
  const count = (
    await db
      .select({ id: artistLinks.id })
      .from(artistLinks)
      .where(eq(artistLinks.artistId, artist.id))
  ).length;
  const [row] = await db
    .insert(artistLinks)
    .values({
      artistId: artist.id,
      title: data.title,
      url: data.url,
      platform: data.platform ?? null,
      type: data.type ?? "custom",
      style: data.style ?? "simple",
      featured: data.featured ?? false,
      enabled: data.enabled ?? true,
      position: count,
    })
    .returning();
  return c.json({ link: row }, 201);
});

// PATCH /api/artist-links/:id
linksRoutes.patch("/:id", async (c) => {
  const artist = await getArtist(c);
  if (!artist) return c.json({ error: "unauthorized" }, 401);
  const db = createDb(c.env.DATABASE_URL);
  const id = c.req.param("id");
  if (!(await ownedLinkId(db, id, artist.id)))
    return c.json({ error: "not found" }, 404);
  const data = parse((await c.req.json().catch(() => ({}))) as never);
  const [row] = await db
    .update(artistLinks)
    .set(data)
    .where(eq(artistLinks.id, id))
    .returning();
  return c.json({ link: row });
});

// POST /api/artist-links/reorder
linksRoutes.post("/reorder", async (c) => {
  const artist = await getArtist(c);
  if (!artist) return c.json({ error: "unauthorized" }, 401);
  const body = (await c.req.json().catch(() => ({}))) as { ids?: unknown };
  if (!Array.isArray(body.ids))
    return c.json({ error: "ids array required." }, 400);
  const db = createDb(c.env.DATABASE_URL);
  const owned = new Set(
    (
      await db
        .select({ id: artistLinks.id })
        .from(artistLinks)
        .where(eq(artistLinks.artistId, artist.id))
    ).map((r) => r.id),
  );
  let pos = 0;
  for (const raw of body.ids) {
    const id = String(raw);
    if (!owned.has(id)) continue;
    await db
      .update(artistLinks)
      .set({ position: pos++ })
      .where(eq(artistLinks.id, id));
  }
  return c.json({ ok: true });
});

// DELETE /api/artist-links/:id
linksRoutes.delete("/:id", async (c) => {
  const artist = await getArtist(c);
  if (!artist) return c.json({ error: "unauthorized" }, 401);
  const db = createDb(c.env.DATABASE_URL);
  const id = c.req.param("id");
  if (!(await ownedLinkId(db, id, artist.id)))
    return c.json({ error: "not found" }, 404);
  await db.delete(artistLinks).where(eq(artistLinks.id, id));
  return c.json({ ok: true });
});

// POST /api/artist-links/:id/click — public, privacy-friendly aggregate count.
linksRoutes.post("/:id/click", async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  await db
    .update(artistLinks)
    .set({ clicks: sql`${artistLinks.clicks} + 1` })
    .where(
      and(eq(artistLinks.id, c.req.param("id")), eq(artistLinks.enabled, true)),
    );
  return c.body(null, 204);
});
