import { Hono } from "hono";
import { and, eq } from "drizzle-orm";
import {
  activityLogs,
  artistProfiles,
  commissions,
  createDb,
  deliveries,
  files,
} from "@mirae/db";
import { type AuthEnv } from "../auth.ts";
import { rateLimit } from "../lib/rate-limit.ts";

type Bindings = AuthEnv & { ASSETS: Fetcher; FILES: R2Bucket };

export const deliveryRoutes = new Hono<{ Bindings: Bindings }>();

// Throttle the public, token-scoped delivery surface (reads + ack).
deliveryRoutes.use("*", rateLimit());

// Resolve a delivery token to its delivery + commission (or null).
async function resolve(db: ReturnType<typeof createDb>, token: string) {
  const [delivery] = await db
    .select()
    .from(deliveries)
    .where(eq(deliveries.token, token))
    .limit(1);
  if (!delivery || delivery.revokedAt) return null;
  const [commission] = await db
    .select()
    .from(commissions)
    .where(eq(commissions.id, delivery.commissionId))
    .limit(1);
  if (!commission) return null;
  return { delivery, commission };
}

// GET /api/delivery/:token — the PUBLIC delivery page payload (no auth).
deliveryRoutes.get("/:token", async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const found = await resolve(db, c.req.param("token"));
  if (!found) return c.json({ error: "not found" }, 404);
  const { delivery, commission } = found;

  const [artist] = await db
    .select({ displayName: artistProfiles.displayName })
    .from(artistProfiles)
    .where(eq(artistProfiles.id, commission.artistId))
    .limit(1);

  const fileRows = await db
    .select({
      id: files.id,
      name: files.name,
      sizeBytes: files.sizeBytes,
      kind: files.kind,
    })
    .from(files)
    .where(
      and(eq(files.commissionId, commission.id), eq(files.kind, "deliverable")),
    );

  return c.json({
    delivery: {
      message: delivery.message,
      deliveredAt: delivery.deliveredAt,
      acknowledgedAt: delivery.acknowledgedAt,
    },
    commission: { title: commission.title },
    artist: artist ?? null,
    files: fileRows,
  });
});

// POST /api/delivery/:token/ack — client acknowledges receipt (PUBLIC).
deliveryRoutes.post("/:token/ack", async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const found = await resolve(db, c.req.param("token"));
  if (!found) return c.json({ error: "not found" }, 404);
  const { delivery, commission } = found;

  if (!delivery.acknowledgedAt) {
    await db
      .update(deliveries)
      .set({ acknowledgedAt: new Date() })
      .where(eq(deliveries.id, delivery.id));
    await db.insert(activityLogs).values({
      artistId: commission.artistId,
      commissionId: commission.id,
      type: "delivery",
      message: "Client acknowledged the delivery",
    });
  }
  return c.json({ ok: true });
});

// GET /api/delivery/:token/files/:fileId — stream a deliverable from R2
// (PUBLIC, gated by the unguessable delivery token).
deliveryRoutes.get("/:token/files/:fileId", async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const found = await resolve(db, c.req.param("token"));
  if (!found) return c.json({ error: "not found" }, 404);

  const [file] = await db
    .select()
    .from(files)
    .where(
      and(
        eq(files.id, c.req.param("fileId")),
        eq(files.commissionId, found.commission.id),
        // Only deliverables are exposed on the delivery page — never leak
        // reference/wip files through the delivery token.
        eq(files.kind, "deliverable"),
      ),
    )
    .limit(1);
  if (!file) return c.json({ error: "not found" }, 404);

  const object = await c.env.FILES.get(file.key);
  if (!object) return c.json({ error: "not found" }, 404);

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set(
    "content-disposition",
    `attachment; filename="${encodeURIComponent(file.name)}"`,
  );
  headers.set("x-content-type-options", "nosniff");
  return new Response(object.body, { headers });
});
