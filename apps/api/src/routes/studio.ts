import { Hono } from "hono";
import { and, asc, eq } from "drizzle-orm";
import { artistProfiles, commissionTypes, createDb } from "@mirae/db";
import { type AuthEnv } from "../auth.ts";

type Bindings = AuthEnv & { ASSETS: Fetcher };

export const studioRoutes = new Hono<{ Bindings: Bindings }>();

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
