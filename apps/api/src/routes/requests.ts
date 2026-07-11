import { Hono } from "hono";
import { desc, eq } from "drizzle-orm";
import { commissionRequests, commissionTypes, createDb } from "@mirae/db";
import { type AuthEnv } from "../auth.ts";
import { getArtist } from "../lib/session.ts";

type Bindings = AuthEnv & { ASSETS: Fetcher };

export const requestsRoutes = new Hono<{ Bindings: Bindings }>();

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
