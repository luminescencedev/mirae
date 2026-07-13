import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { createDb, artistProfiles } from "@mirae/db";
import { normalizeAppearance, type StudioAppearance } from "@mirae/shared";
import { type AuthEnv } from "../auth.ts";
import { getArtist, getUserId } from "../lib/session.ts";

const STATUSES = ["open", "waitlist", "closed"] as const;
type Status = (typeof STATUSES)[number];

const IMAGE_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/avif",
]);
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8 MB

type Bindings = AuthEnv & { ASSETS: Fetcher; FILES: R2Bucket };

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
    appearance?: StudioAppearance;
  } = {};
  if (typeof body.displayName === "string" && body.displayName.trim())
    patch.displayName = body.displayName.trim();
  if ("tagline" in body)
    patch.tagline = body.tagline ? String(body.tagline) : null;
  if ("bio" in body) patch.bio = body.bio ? String(body.bio) : null;
  if (STATUSES.includes(body.status)) patch.status = body.status as Status;
  if ("appearance" in body)
    patch.appearance = normalizeAppearance(body.appearance);

  if (Object.keys(patch).length === 0) return c.json({ profile: artist });

  const db = createDb(c.env.DATABASE_URL);
  const [row] = await db
    .update(artistProfiles)
    .set(patch)
    .where(eq(artistProfiles.id, artist.id))
    .returning();
  return c.json({ profile: row });
});

// Upload profile media (avatar or cover) → R2. Replaces the previous object.
for (const kind of ["avatar", "cover"] as const) {
  const column = kind === "avatar" ? "avatarR2Key" : "coverR2Key";
  artistsRoutes.post(`/me/${kind}`, async (c) => {
    const artist = await getArtist(c);
    if (!artist) return c.json({ error: "unauthorized" }, 401);
    const form = await c.req.formData().catch(() => null);
    const file = form?.get("file");
    if (!(file instanceof File)) return c.json({ error: "No file." }, 400);
    if (!IMAGE_MIME.has(file.type))
      return c.json({ error: "Unsupported image type." }, 415);
    if (file.size > MAX_UPLOAD_BYTES)
      return c.json({ error: "Image exceeds 8 MB." }, 413);

    const key = `artists/${artist.id}/${kind}/${crypto.randomUUID()}`;
    await c.env.FILES.put(key, await file.arrayBuffer(), {
      httpMetadata: { contentType: file.type },
    });
    const db = createDb(c.env.DATABASE_URL);
    const [row] = await db
      .update(artistProfiles)
      .set({ [column]: key })
      .where(eq(artistProfiles.id, artist.id))
      .returning();
    // Best-effort cleanup of the previous object.
    const prev = artist[column];
    if (prev && prev !== key) await c.env.FILES.delete(prev);
    return c.json({ profile: row });
  });
}

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
