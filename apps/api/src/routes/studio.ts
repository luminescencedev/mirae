import { Hono } from "hono";
import { and, asc, eq } from "drizzle-orm";
import {
  artistProfiles,
  commissionRequests,
  commissionTypes,
  createDb,
} from "@mirae/db";
import { type AuthEnv } from "../auth.ts";

type Bindings = AuthEnv & { ASSETS: Fetcher };

export const studioRoutes = new Hono<{ Bindings: Bindings }>();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// GET /api/studio/:handle — the PUBLIC studio page payload (no auth).
// Returns the artist profile + their active commission types, or 404.
studioRoutes.get("/:handle", async (c) => {
  const handle = c.req.param("handle").replace(/^@/, "").trim().toLowerCase();
  if (!handle) return c.json({ error: "not found" }, 404);

  const db = createDb(c.env.DATABASE_URL);
  const [profile] = await db
    .select()
    .from(artistProfiles)
    .where(eq(artistProfiles.handle, handle))
    .limit(1);

  if (!profile) return c.json({ error: "not found" }, 404);

  const types = await db
    .select()
    .from(commissionTypes)
    .where(
      and(
        eq(commissionTypes.artistId, profile.id),
        eq(commissionTypes.active, true),
      ),
    )
    .orderBy(asc(commissionTypes.sortOrder));

  return c.json({
    profile: {
      handle: profile.handle,
      displayName: profile.displayName,
      tagline: profile.tagline,
      bio: profile.bio,
      status: profile.status,
    },
    commissionTypes: types,
  });
});

// POST /api/studio/:handle/requests — submit a commission request (PUBLIC, no
// account needed). Creates a commission_requests row for the studio.
studioRoutes.post("/:handle/requests", async (c) => {
  const handle = c.req.param("handle").replace(/^@/, "").trim().toLowerCase();
  if (!handle) return c.json({ error: "not found" }, 404);

  const body = (await c.req.json().catch(() => ({}))) as {
    clientName?: unknown;
    clientEmail?: unknown;
    commissionTypeId?: unknown;
    budget?: unknown;
    deadline?: unknown;
    message?: unknown;
  };

  const clientName = String(body.clientName ?? "").trim();
  const clientEmail = String(body.clientEmail ?? "")
    .trim()
    .toLowerCase();
  const brief = String(body.message ?? "").trim();
  const budget = body.budget ? String(body.budget).trim() : null;
  const deadline = body.deadline ? String(body.deadline).trim() : null;

  if (!clientName) return c.json({ error: "Your name is required." }, 400);
  if (!EMAIL_RE.test(clientEmail))
    return c.json({ error: "A valid email is required." }, 400);
  if (!brief) return c.json({ error: "A brief is required." }, 400);

  const db = createDb(c.env.DATABASE_URL);
  const [profile] = await db
    .select()
    .from(artistProfiles)
    .where(eq(artistProfiles.handle, handle))
    .limit(1);
  if (!profile) return c.json({ error: "not found" }, 404);
  if (profile.status === "closed")
    return c.json({ error: "This studio isn't taking requests." }, 403);

  // Validate the chosen type belongs to this artist (else leave it null).
  let commissionTypeId: string | null = null;
  if (typeof body.commissionTypeId === "string" && body.commissionTypeId) {
    const [type] = await db
      .select({ id: commissionTypes.id })
      .from(commissionTypes)
      .where(
        and(
          eq(commissionTypes.id, body.commissionTypeId),
          eq(commissionTypes.artistId, profile.id),
        ),
      )
      .limit(1);
    if (type) commissionTypeId = type.id;
  }

  // No deadline column on requests — fold it into the message.
  const message = deadline ? `Deadline: ${deadline}\n\n${brief}` : brief;

  const [row] = await db
    .insert(commissionRequests)
    .values({
      artistId: profile.id,
      commissionTypeId,
      clientName,
      clientEmail,
      budget,
      message,
    })
    .returning({ id: commissionRequests.id });

  return c.json({ ok: true, id: row.id }, 201);
});
