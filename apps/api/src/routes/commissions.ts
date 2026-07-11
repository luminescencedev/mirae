import { Hono } from "hono";
import { and, desc, eq } from "drizzle-orm";
import {
  commissionRequests,
  commissionStatus,
  commissions,
  createDb,
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
  return c.json({ commission: row });
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
