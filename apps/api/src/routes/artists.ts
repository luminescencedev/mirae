import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { createDb, artistProfiles } from "@mirae/db";
import { type AuthEnv } from "../auth.ts";
import { getArtist, getUserId } from "../lib/session.ts";

const STATUSES = ["open", "waitlist", "closed"] as const;
type Status = (typeof STATUSES)[number];

type Bindings = AuthEnv & { ASSETS: Fetcher };

export const artistsRoutes = new Hono<{ Bindings: Bindings }>();

// The signed-in artist's profile (null if they haven't onboarded).
artistsRoutes.get("/me", async (c) => {
  const userId = await getUserId(c);
  if (!userId) return c.json({ error: "unauthorized" }, 401);
  const profile = await getArtist(c);
  return c.json({ profile: profile ?? null });
});

// Update the signed-in artist's profile (display name, tagline, bio, status).
artistsRoutes.patch("/me", async (c) => {
  const artist = await getArtist(c);
  if (!artist) return c.json({ error: "unauthorized" }, 401);
  const body = await c.req.json().catch(() => ({}));

  const patch: {
    displayName?: string;
    tagline?: string | null;
    bio?: string | null;
    status?: Status;
  } = {};
  if (typeof body.displayName === "string" && body.displayName.trim())
    patch.displayName = body.displayName.trim();
  if ("tagline" in body)
    patch.tagline = body.tagline ? String(body.tagline) : null;
  if ("bio" in body) patch.bio = body.bio ? String(body.bio) : null;
  if (STATUSES.includes(body.status)) patch.status = body.status as Status;

  if (Object.keys(patch).length === 0) return c.json({ profile: artist });

  const db = createDb(c.env.DATABASE_URL);
  const [row] = await db
    .update(artistProfiles)
    .set(patch)
    .where(eq(artistProfiles.id, artist.id))
    .returning();
  return c.json({ profile: row });
});

// Create the artist profile during onboarding.
artistsRoutes.post("/", async (c) => {
  const userId = await getUserId(c);
  if (!userId) return c.json({ error: "unauthorized" }, 401);

  const body = await c.req.json().catch(() => ({}));
  const handle = String(body.handle ?? "")
    .trim()
    .toLowerCase();
  const displayName = String(body.displayName ?? "").trim();
  if (!/^[a-z0-9_]{2,30}$/.test(handle)) {
    return c.json({ error: "Handle must be 2–30 chars (a–z, 0–9, _)." }, 400);
  }
  if (!displayName) return c.json({ error: "Display name is required." }, 400);

  const db = createDb(c.env.DATABASE_URL);
  try {
    const [profile] = await db
      .insert(artistProfiles)
      .values({ userId, handle, displayName })
      .returning();
    return c.json({ profile });
  } catch {
    return c.json(
      { error: "That handle is taken, or you already have a studio." },
      409,
    );
  }
});
