import { Hono } from "hono";
import { and, asc, eq, inArray } from "drizzle-orm";
import {
  createDb,
  portfolioAssets,
  portfolioProjects,
  type Database,
} from "@mirae/db";
import { PROJECT_TYPES, PROJECT_VISIBILITIES } from "@mirae/shared";
import { type AuthEnv } from "../auth.ts";
import { getArtist } from "../lib/session.ts";
import { imageSize } from "../lib/image-size.ts";

type Bindings = AuthEnv & { ASSETS: Fetcher; FILES: R2Bucket };

export const portfolioRoutes = new Hono<{ Bindings: Bindings }>();

const IMAGE_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/avif",
]);
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB

function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "project"
  );
}

// A slug unique within the artist's portfolio (append a short suffix on clash).
async function uniqueSlug(
  db: Database,
  artistId: string,
  base: string,
): Promise<string> {
  const taken = new Set(
    (
      await db
        .select({ slug: portfolioProjects.slug })
        .from(portfolioProjects)
        .where(eq(portfolioProjects.artistId, artistId))
    ).map((r) => r.slug),
  );
  if (!taken.has(base)) return base;
  for (let i = 2; i < 1000; i++) {
    const s = `${base}-${i}`;
    if (!taken.has(s)) return s;
  }
  return `${base}-${crypto.randomUUID().slice(0, 6)}`;
}

// Assert a project belongs to the artist; returns its id or null.
async function ownedProjectId(
  db: Database,
  projectId: string,
  artistId: string,
): Promise<string | null> {
  const [row] = await db
    .select({ id: portfolioProjects.id })
    .from(portfolioProjects)
    .where(
      and(
        eq(portfolioProjects.id, projectId),
        eq(portfolioProjects.artistId, artistId),
      ),
    );
  return row?.id ?? null;
}

// ---- Projects ---------------------------------------------------------------

// GET /api/portfolio/projects — all of the artist's projects + their assets.
portfolioRoutes.get("/projects", async (c) => {
  const artist = await getArtist(c);
  if (!artist) return c.json({ error: "unauthorized" }, 401);
  const db = createDb(c.env.DATABASE_URL);
  const projects = await db
    .select()
    .from(portfolioProjects)
    .where(eq(portfolioProjects.artistId, artist.id))
    .orderBy(asc(portfolioProjects.position));
  const ids = projects.map((p) => p.id);
  const assets = ids.length
    ? await db
        .select()
        .from(portfolioAssets)
        .where(inArray(portfolioAssets.projectId, ids))
        .orderBy(asc(portfolioAssets.position))
    : [];
  const byProject = new Map<string, typeof assets>();
  for (const a of assets) {
    const list = byProject.get(a.projectId) ?? [];
    list.push(a);
    byProject.set(a.projectId, list);
  }
  return c.json({
    projects: projects.map((p) => ({
      ...p,
      assets: byProject.get(p.id) ?? [],
    })),
  });
});

// POST /api/portfolio/projects — create a draft project.
portfolioRoutes.post("/projects", async (c) => {
  const artist = await getArtist(c);
  if (!artist) return c.json({ error: "unauthorized" }, 401);
  const body = (await c.req.json().catch(() => ({}))) as Record<
    string,
    unknown
  >;
  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title) return c.json({ error: "Title is required." }, 400);
  const db = createDb(c.env.DATABASE_URL);
  const slug = await uniqueSlug(db, artist.id, slugify(title));
  // New projects append to the end of the artist's ordering.
  const existing = await db
    .select({ id: portfolioProjects.id })
    .from(portfolioProjects)
    .where(eq(portfolioProjects.artistId, artist.id));
  const [row] = await db
    .insert(portfolioProjects)
    .values({ artistId: artist.id, title, slug, position: existing.length })
    .returning();
  return c.json({ project: { ...row, assets: [] } }, 201);
});

// PATCH /api/portfolio/projects/:id — update project fields.
portfolioRoutes.patch("/projects/:id", async (c) => {
  const artist = await getArtist(c);
  if (!artist) return c.json({ error: "unauthorized" }, 401);
  const body = (await c.req.json().catch(() => ({}))) as Record<
    string,
    unknown
  >;
  const db = createDb(c.env.DATABASE_URL);
  const id = c.req.param("id");
  if (!(await ownedProjectId(db, id, artist.id)))
    return c.json({ error: "not found" }, 404);

  const set: Partial<typeof portfolioProjects.$inferInsert> = {};
  if (typeof body.title === "string" && body.title.trim())
    set.title = body.title.trim();
  if ("description" in body)
    set.description = body.description ? String(body.description) : null;
  if (
    typeof body.projectType === "string" &&
    (PROJECT_TYPES as readonly string[]).includes(body.projectType)
  )
    set.projectType = body.projectType as (typeof PROJECT_TYPES)[number];
  if (
    typeof body.visibility === "string" &&
    (PROJECT_VISIBILITIES as readonly string[]).includes(body.visibility)
  ) {
    const v = body.visibility as (typeof PROJECT_VISIBILITIES)[number];
    set.visibility = v;
    // Stamp publishedAt the first time a project goes public.
    if (v === "published") set.publishedAt = new Date();
  }

  // Cover asset — must belong to this project (or explicit null to clear).
  if ("coverAssetId" in body) {
    const cid = body.coverAssetId;
    if (cid == null) set.coverAssetId = null;
    else if (typeof cid === "string") {
      const [a] = await db
        .select({ id: portfolioAssets.id })
        .from(portfolioAssets)
        .where(
          and(eq(portfolioAssets.id, cid), eq(portfolioAssets.projectId, id)),
        )
        .limit(1);
      if (a) set.coverAssetId = cid;
    }
  }

  // Featured is exclusive per artist.
  if (body.featured === true) {
    await db
      .update(portfolioProjects)
      .set({ featured: false })
      .where(eq(portfolioProjects.artistId, artist.id));
    set.featured = true;
  } else if (body.featured === false) {
    set.featured = false;
  }

  const [row] = await db
    .update(portfolioProjects)
    .set(set)
    .where(eq(portfolioProjects.id, id))
    .returning();
  return c.json({ project: row });
});

// POST /api/portfolio/projects/reorder — bulk-set project positions.
portfolioRoutes.post("/projects/reorder", async (c) => {
  const artist = await getArtist(c);
  if (!artist) return c.json({ error: "unauthorized" }, 401);
  const body = (await c.req.json().catch(() => ({}))) as { ids?: unknown };
  if (!Array.isArray(body.ids))
    return c.json({ error: "ids array required." }, 400);
  const db = createDb(c.env.DATABASE_URL);
  const owned = new Set(
    (
      await db
        .select({ id: portfolioProjects.id })
        .from(portfolioProjects)
        .where(eq(portfolioProjects.artistId, artist.id))
    ).map((r) => r.id),
  );
  let pos = 0;
  for (const raw of body.ids) {
    const id = String(raw);
    if (!owned.has(id)) continue;
    await db
      .update(portfolioProjects)
      .set({ position: pos++ })
      .where(eq(portfolioProjects.id, id));
  }
  return c.json({ ok: true });
});

// POST /api/portfolio/assets/reorder — bulk-set asset positions within their
// project. Only assets the artist owns are touched.
portfolioRoutes.post("/assets/reorder", async (c) => {
  const artist = await getArtist(c);
  if (!artist) return c.json({ error: "unauthorized" }, 401);
  const body = (await c.req.json().catch(() => ({}))) as { ids?: unknown };
  if (!Array.isArray(body.ids))
    return c.json({ error: "ids array required." }, 400);
  const db = createDb(c.env.DATABASE_URL);
  const ids = body.ids.map(String);
  if (ids.length === 0) return c.json({ ok: true });
  // Owned assets = assets whose project belongs to this artist.
  const owned = new Set(
    (
      await db
        .select({ id: portfolioAssets.id })
        .from(portfolioAssets)
        .innerJoin(
          portfolioProjects,
          eq(portfolioAssets.projectId, portfolioProjects.id),
        )
        .where(
          and(
            eq(portfolioProjects.artistId, artist.id),
            inArray(portfolioAssets.id, ids),
          ),
        )
    ).map((r) => r.id),
  );
  let pos = 0;
  for (const id of ids) {
    if (!owned.has(id)) continue;
    await db
      .update(portfolioAssets)
      .set({ position: pos++ })
      .where(eq(portfolioAssets.id, id));
  }
  return c.json({ ok: true });
});

// DELETE /api/portfolio/projects/:id — delete project, its assets + R2 objects.
portfolioRoutes.delete("/projects/:id", async (c) => {
  const artist = await getArtist(c);
  if (!artist) return c.json({ error: "unauthorized" }, 401);
  const db = createDb(c.env.DATABASE_URL);
  const id = c.req.param("id");
  if (!(await ownedProjectId(db, id, artist.id)))
    return c.json({ error: "not found" }, 404);
  // Clean R2 first, then rows (asset rows cascade with the project).
  const assets = await db
    .select({ r2Key: portfolioAssets.r2Key })
    .from(portfolioAssets)
    .where(eq(portfolioAssets.projectId, id));
  await Promise.all(assets.map((a) => c.env.FILES.delete(a.r2Key)));
  await db.delete(portfolioProjects).where(eq(portfolioProjects.id, id));
  return c.json({ ok: true });
});

// ---- Assets -----------------------------------------------------------------

// POST /api/portfolio/projects/:id/assets — upload an image (multipart → R2).
portfolioRoutes.post("/projects/:id/assets", async (c) => {
  const artist = await getArtist(c);
  if (!artist) return c.json({ error: "unauthorized" }, 401);
  const db = createDb(c.env.DATABASE_URL);
  const projectId = c.req.param("id");
  if (!(await ownedProjectId(db, projectId, artist.id)))
    return c.json({ error: "not found" }, 404);

  const form = await c.req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return c.json({ error: "No file." }, 400);
  if (!IMAGE_MIME.has(file.type))
    return c.json({ error: "Unsupported image type." }, 415);
  if (file.size > MAX_UPLOAD_BYTES)
    return c.json({ error: "Image exceeds 10 MB." }, 413);

  const key = `artists/${artist.id}/portfolio/${projectId}/${crypto.randomUUID()}`;
  const bytes = await file.arrayBuffer();
  const dims = imageSize(bytes);
  await c.env.FILES.put(key, bytes, {
    httpMetadata: { contentType: file.type },
  });
  const count = (
    await db
      .select({ id: portfolioAssets.id })
      .from(portfolioAssets)
      .where(eq(portfolioAssets.projectId, projectId))
  ).length;
  const [row] = await db
    .insert(portfolioAssets)
    .values({
      projectId,
      r2Key: key,
      mimeType: file.type,
      sizeBytes: file.size,
      width: dims?.width ?? null,
      height: dims?.height ?? null,
      position: count,
    })
    .returning();
  return c.json({ asset: row }, 201);
});

// PATCH /api/portfolio/assets/:id — alt text (position via reorder).
portfolioRoutes.patch("/assets/:id", async (c) => {
  const artist = await getArtist(c);
  if (!artist) return c.json({ error: "unauthorized" }, 401);
  const db = createDb(c.env.DATABASE_URL);
  const asset = await ownedAsset(db, c.req.param("id"), artist.id);
  if (!asset) return c.json({ error: "not found" }, 404);
  const body = (await c.req.json().catch(() => ({}))) as { altText?: unknown };
  const [row] = await db
    .update(portfolioAssets)
    .set({ altText: body.altText == null ? null : String(body.altText) })
    .where(eq(portfolioAssets.id, asset.id))
    .returning();
  return c.json({ asset: row });
});

// DELETE /api/portfolio/assets/:id — remove asset (R2 + row).
portfolioRoutes.delete("/assets/:id", async (c) => {
  const artist = await getArtist(c);
  if (!artist) return c.json({ error: "unauthorized" }, 401);
  const db = createDb(c.env.DATABASE_URL);
  const asset = await ownedAsset(db, c.req.param("id"), artist.id);
  if (!asset) return c.json({ error: "not found" }, 404);
  await c.env.FILES.delete(asset.r2Key);
  await db.delete(portfolioAssets).where(eq(portfolioAssets.id, asset.id));
  return c.json({ ok: true });
});

// GET /api/portfolio/assets/:id/raw — image stream. Public for published
// projects; the owner can also stream their own drafts (cookie session) so
// the portfolio manager can preview unpublished work.
portfolioRoutes.get("/assets/:id/raw", async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const [row] = await db
    .select({
      r2Key: portfolioAssets.r2Key,
      mimeType: portfolioAssets.mimeType,
      visibility: portfolioProjects.visibility,
      artistId: portfolioProjects.artistId,
    })
    .from(portfolioAssets)
    .innerJoin(
      portfolioProjects,
      eq(portfolioAssets.projectId, portfolioProjects.id),
    )
    .where(eq(portfolioAssets.id, c.req.param("id")));
  if (!row) return c.json({ error: "not found" }, 404);
  if (row.visibility !== "published") {
    const artist = await getArtist(c);
    if (artist?.id !== row.artistId) return c.json({ error: "not found" }, 404);
  }
  const obj = await c.env.FILES.get(row.r2Key);
  if (!obj) return c.json({ error: "not found" }, 404);
  return new Response(obj.body, {
    headers: {
      "content-type": row.mimeType,
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
});

// Assert an asset's project belongs to the artist; returns {id,r2Key} or null.
async function ownedAsset(db: Database, assetId: string, artistId: string) {
  const [row] = await db
    .select({ id: portfolioAssets.id, r2Key: portfolioAssets.r2Key })
    .from(portfolioAssets)
    .innerJoin(
      portfolioProjects,
      eq(portfolioAssets.projectId, portfolioProjects.id),
    )
    .where(
      and(
        eq(portfolioAssets.id, assetId),
        eq(portfolioProjects.artistId, artistId),
      ),
    );
  return row ?? null;
}
