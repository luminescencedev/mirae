import { Hono, type Context } from "hono";
import { eq } from "drizzle-orm";
import { createDb, artistProfiles } from "@mirae/db";
import { makeAuth, type AuthEnv } from "../auth.ts";

type Bindings = AuthEnv & { ASSETS: Fetcher };
type AppContext = Context<{ Bindings: Bindings }>;

export const artistsRoutes = new Hono<{ Bindings: Bindings }>();

async function currentUserId(c: AppContext): Promise<string | null> {
  const auth = makeAuth(c.env);
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  return session?.user.id ?? null;
}

// The signed-in artist's profile (null if they haven't onboarded).
artistsRoutes.get("/me", async (c) => {
  const userId = await currentUserId(c);
  if (!userId) return c.json({ error: "unauthorized" }, 401);
  const db = createDb(c.env.DATABASE_URL);
  const [profile] = await db
    .select()
    .from(artistProfiles)
    .where(eq(artistProfiles.userId, userId));
  return c.json({ profile: profile ?? null });
});

// Create the artist profile during onboarding.
artistsRoutes.post("/", async (c) => {
  const userId = await currentUserId(c);
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
