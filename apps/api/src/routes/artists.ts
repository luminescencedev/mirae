import { Hono } from "hono";
import { createDb, artistProfiles } from "@mirae/db";
import { type AuthEnv } from "../auth.ts";
import { getArtist, getUserId } from "../lib/session.ts";

type Bindings = AuthEnv & { ASSETS: Fetcher };

export const artistsRoutes = new Hono<{ Bindings: Bindings }>();

// The signed-in artist's profile (null if they haven't onboarded).
artistsRoutes.get("/me", async (c) => {
  const userId = await getUserId(c);
  if (!userId) return c.json({ error: "unauthorized" }, 401);
  const profile = await getArtist(c);
  return c.json({ profile: profile ?? null });
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
