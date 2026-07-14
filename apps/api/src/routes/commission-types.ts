import { Hono } from "hono";
import { and, asc, eq } from "drizzle-orm";
import { commissionTypes, createDb } from "@mirae/db";
import { type AuthEnv } from "../auth.ts";
import { getArtist } from "../lib/session.ts";

type Bindings = AuthEnv & { ASSETS: Fetcher; FILES: R2Bucket };

export const commissionTypesRoutes = new Hono<{ Bindings: Bindings }>();

const IMAGE_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/avif",
]);
const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8 MB

// Shape a row for the client: expose a served image URL, hide the R2 key.
function present(row: typeof commissionTypes.$inferSelect) {
  const { imageR2Key, ...rest } = row;
  return {
    ...rest,
    imageUrl: imageR2Key ? `/api/commission-types/${row.id}/image` : null,
  };
}

type Body = {
  name?: unknown;
  blurb?: unknown;
  priceFromCents?: unknown;
  turnaround?: unknown;
  slots?: unknown;
  active?: unknown;
  sortOrder?: unknown;
};

// Normalize an incoming payload to the columns we accept.
function parse(body: Body) {
  const out: {
    name?: string;
    blurb?: string | null;
    priceFromCents?: number | null;
    turnaround?: string | null;
    slots?: number | null;
    active?: boolean;
    sortOrder?: number;
  } = {};
  if (typeof body.name === "string") out.name = body.name.trim();
  if ("blurb" in body) out.blurb = body.blurb ? String(body.blurb) : null;
  if ("priceFromCents" in body)
    out.priceFromCents =
      body.priceFromCents == null ? null : Number(body.priceFromCents);
  if ("turnaround" in body)
    out.turnaround = body.turnaround ? String(body.turnaround) : null;
  if ("slots" in body)
    out.slots = body.slots == null ? null : Number(body.slots);
  if (typeof body.active === "boolean") out.active = body.active;
  if (typeof body.sortOrder === "number") out.sortOrder = body.sortOrder;
  return out;
}

// GET /api/commission-types — the artist's offerings.
commissionTypesRoutes.get("/", async (c) => {
  const artist = await getArtist(c);
  if (!artist) return c.json({ error: "unauthorized" }, 401);
  const db = createDb(c.env.DATABASE_URL);
  const rows = await db
    .select()
    .from(commissionTypes)
    .where(eq(commissionTypes.artistId, artist.id))
    .orderBy(asc(commissionTypes.sortOrder));
  return c.json({ commissionTypes: rows.map(present) });
});

// POST /api/commission-types
commissionTypesRoutes.post("/", async (c) => {
  const artist = await getArtist(c);
  if (!artist) return c.json({ error: "unauthorized" }, 401);
  const data = parse(await c.req.json().catch(() => ({})));
  if (!data.name) return c.json({ error: "Name is required." }, 400);
  const db = createDb(c.env.DATABASE_URL);
  const [row] = await db
    .insert(commissionTypes)
    .values({ ...data, name: data.name, artistId: artist.id })
    .returning();
  return c.json({ commissionType: present(row) });
});

// PATCH /api/commission-types/:id
commissionTypesRoutes.patch("/:id", async (c) => {
  const artist = await getArtist(c);
  if (!artist) return c.json({ error: "unauthorized" }, 401);
  const data = parse(await c.req.json().catch(() => ({})));
  const db = createDb(c.env.DATABASE_URL);
  const [row] = await db
    .update(commissionTypes)
    .set(data)
    .where(
      and(
        eq(commissionTypes.id, c.req.param("id")),
        eq(commissionTypes.artistId, artist.id),
      ),
    )
    .returning();
  if (!row) return c.json({ error: "not found" }, 404);
  return c.json({ commissionType: present(row) });
});

// POST /api/commission-types/:id/image — upload a representative image → R2.
commissionTypesRoutes.post("/:id/image", async (c) => {
  const artist = await getArtist(c);
  if (!artist) return c.json({ error: "unauthorized" }, 401);
  const db = createDb(c.env.DATABASE_URL);
  const id = c.req.param("id");
  const [existing] = await db
    .select()
    .from(commissionTypes)
    .where(
      and(eq(commissionTypes.id, id), eq(commissionTypes.artistId, artist.id)),
    )
    .limit(1);
  if (!existing) return c.json({ error: "not found" }, 404);

  const form = await c.req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return c.json({ error: "No file." }, 400);
  if (!IMAGE_MIME.has(file.type))
    return c.json({ error: "Unsupported image type." }, 415);
  if (file.size > MAX_IMAGE_BYTES)
    return c.json({ error: "Image exceeds 8 MB." }, 413);

  const key = `artists/${artist.id}/commission-types/${id}/${crypto.randomUUID()}`;
  await c.env.FILES.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type },
  });
  const [row] = await db
    .update(commissionTypes)
    .set({ imageR2Key: key })
    .where(eq(commissionTypes.id, id))
    .returning();
  if (existing.imageR2Key && existing.imageR2Key !== key)
    await c.env.FILES.delete(existing.imageR2Key);
  return c.json({ commissionType: present(row) });
});

// DELETE /api/commission-types/:id/image — remove the image.
commissionTypesRoutes.delete("/:id/image", async (c) => {
  const artist = await getArtist(c);
  if (!artist) return c.json({ error: "unauthorized" }, 401);
  const db = createDb(c.env.DATABASE_URL);
  const id = c.req.param("id");
  const [existing] = await db
    .select()
    .from(commissionTypes)
    .where(
      and(eq(commissionTypes.id, id), eq(commissionTypes.artistId, artist.id)),
    )
    .limit(1);
  if (!existing) return c.json({ error: "not found" }, 404);
  if (existing.imageR2Key) await c.env.FILES.delete(existing.imageR2Key);
  const [row] = await db
    .update(commissionTypes)
    .set({ imageR2Key: null })
    .where(eq(commissionTypes.id, id))
    .returning();
  return c.json({ commissionType: present(row) });
});

// GET /api/commission-types/:id/image — PUBLIC image stream (no auth).
commissionTypesRoutes.get("/:id/image", async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const [row] = await db
    .select({ imageR2Key: commissionTypes.imageR2Key })
    .from(commissionTypes)
    .where(eq(commissionTypes.id, c.req.param("id")))
    .limit(1);
  if (!row?.imageR2Key) return c.json({ error: "not found" }, 404);
  const obj = await c.env.FILES.get(row.imageR2Key);
  if (!obj) return c.json({ error: "not found" }, 404);
  return new Response(obj.body, {
    headers: {
      "content-type": obj.httpMetadata?.contentType ?? "image/jpeg",
      "cache-control": "public, max-age=3600",
      "x-content-type-options": "nosniff",
    },
  });
});

// DELETE /api/commission-types/:id
commissionTypesRoutes.delete("/:id", async (c) => {
  const artist = await getArtist(c);
  if (!artist) return c.json({ error: "unauthorized" }, 401);
  const db = createDb(c.env.DATABASE_URL);
  const [row] = await db
    .delete(commissionTypes)
    .where(
      and(
        eq(commissionTypes.id, c.req.param("id")),
        eq(commissionTypes.artistId, artist.id),
      ),
    )
    .returning();
  if (!row) return c.json({ error: "not found" }, 404);
  if (row.imageR2Key) await c.env.FILES.delete(row.imageR2Key);
  return c.json({ ok: true });
});
