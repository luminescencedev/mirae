import { Hono } from "hono";
import { and, desc, eq } from "drizzle-orm";
import { commissionRequests, commissionTypes, createDb } from "@mirae/db";
import { type AuthEnv } from "../auth.ts";
import { getArtist } from "../lib/session.ts";

type Bindings = AuthEnv & { ASSETS: Fetcher };

export const requestsRoutes = new Hono<{ Bindings: Bindings }>();

// Statuses the artist can set from the inbox.
const SETTABLE = ["new", "accepted", "declined"] as const;
type Settable = (typeof SETTABLE)[number];

// GET /api/requests — the signed-in artist's inbox, newest first.
// Joins the commission type name for display.
requestsRoutes.get("/", async (c) => {
  const artist = await getArtist(c);
  if (!artist) return c.json({ error: "unauthorized" }, 401);

  const db = createDb(c.env.DATABASE_URL);
  const rows = await db
    .select({
      id: commissionRequests.id,
      clientName: commissionRequests.clientName,
      clientEmail: commissionRequests.clientEmail,
      budget: commissionRequests.budget,
      message: commissionRequests.message,
      status: commissionRequests.status,
      createdAt: commissionRequests.createdAt,
      commissionTypeId: commissionRequests.commissionTypeId,
      commissionTypeName: commissionTypes.name,
    })
    .from(commissionRequests)
    .leftJoin(
      commissionTypes,
      eq(commissionTypes.id, commissionRequests.commissionTypeId),
    )
    .where(eq(commissionRequests.artistId, artist.id))
    .orderBy(desc(commissionRequests.createdAt));

  return c.json({ requests: rows });
});

// PATCH /api/requests/:id — set the request status (accept / decline).
requestsRoutes.patch("/:id", async (c) => {
  const artist = await getArtist(c);
  if (!artist) return c.json({ error: "unauthorized" }, 401);

  const body = (await c.req.json().catch(() => ({}))) as { status?: unknown };
  if (!SETTABLE.includes(body.status as Settable))
    return c.json({ error: "Invalid status." }, 400);

  const db = createDb(c.env.DATABASE_URL);
  const [row] = await db
    .update(commissionRequests)
    .set({ status: body.status as Settable })
    .where(
      and(
        eq(commissionRequests.id, c.req.param("id")),
        eq(commissionRequests.artistId, artist.id),
      ),
    )
    .returning({
      id: commissionRequests.id,
      status: commissionRequests.status,
    });
  if (!row) return c.json({ error: "not found" }, 404);
  return c.json({ request: row });
});
