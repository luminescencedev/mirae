import { Hono } from "hono";
import { and, asc, eq } from "drizzle-orm";
import { commissionTypes, createDb } from "@mirae/db";
import { type AuthEnv } from "../auth.ts";
import { getArtist } from "../lib/session.ts";

type Bindings = AuthEnv & { ASSETS: Fetcher };

export const commissionTypesRoutes = new Hono<{ Bindings: Bindings }>();

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
  return c.json({ commissionTypes: rows });
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
  return c.json({ commissionType: row });
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
  return c.json({ commissionType: row });
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
  return c.json({ ok: true });
});
