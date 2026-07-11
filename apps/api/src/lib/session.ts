import { type Context } from "hono";
import { eq } from "drizzle-orm";
import { artistProfiles, createDb, type ArtistProfile } from "@mirae/db";
import { makeAuth, type AuthEnv } from "../auth.ts";

// The signed-in user's id, or null.
export async function getUserId(c: Context): Promise<string | null> {
  const env = c.env as AuthEnv;
  const session = await makeAuth(env).api.getSession({
    headers: c.req.raw.headers,
  });
  return session?.user.id ?? null;
}

// The signed-in user's artist profile, or null (no session / not onboarded).
export async function getArtist(c: Context): Promise<ArtistProfile | null> {
  const userId = await getUserId(c);
  if (!userId) return null;
  const db = createDb((c.env as AuthEnv).DATABASE_URL);
  const [profile] = await db
    .select()
    .from(artistProfiles)
    .where(eq(artistProfiles.userId, userId));
  return profile ?? null;
}
