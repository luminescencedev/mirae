import { Hono } from "hono";
import { eq, inArray } from "drizzle-orm";
import {
  accounts,
  artistLinks,
  artistProfiles,
  commissionTypes,
  commissions,
  createDb,
  deliveries,
  files,
  portalMessages,
  portalThreads,
  portfolioAssets,
  portfolioProjects,
  quotes,
  revisionRounds,
  sessions,
  users,
} from "@mirae/db";
import {
  normalizeAbout,
  normalizeAppearance,
  normalizeFaq,
  type FaqItem,
  type StudioAppearance,
} from "@mirae/shared";
import { type AuthEnv } from "../auth.ts";
import { getArtist, getUserId } from "../lib/session.ts";
import { audit } from "../lib/log.ts";

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
    about?: string | null;
    faq?: FaqItem[];
    metaTitle?: string | null;
    metaDescription?: string | null;
    status?: Status;
    appearance?: StudioAppearance;
  } = {};
  if (typeof body.displayName === "string" && body.displayName.trim())
    patch.displayName = body.displayName.trim();
  if ("tagline" in body)
    patch.tagline = body.tagline ? String(body.tagline) : null;
  if ("bio" in body) patch.bio = body.bio ? String(body.bio) : null;
  if ("about" in body) patch.about = normalizeAbout(body.about);
  if ("faq" in body) patch.faq = normalizeFaq(body.faq);
  if ("metaTitle" in body)
    patch.metaTitle = body.metaTitle
      ? String(body.metaTitle).trim().slice(0, 70)
      : null;
  if ("metaDescription" in body)
    patch.metaDescription = body.metaDescription
      ? String(body.metaDescription).trim().slice(0, 200)
      : null;
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
// GET /api/artists/me/export — full data export for the signed-in artist
// (GDPR-style portability). Returns a downloadable JSON document.
artistsRoutes.get("/me/export", async (c) => {
  const artist = await getArtist(c);
  if (!artist) return c.json({ error: "unauthorized" }, 401);
  const db = createDb(c.env.DATABASE_URL);
  const id = artist.id;

  const [types, projects, links, coms] = await Promise.all([
    db.select().from(commissionTypes).where(eq(commissionTypes.artistId, id)),
    db
      .select()
      .from(portfolioProjects)
      .where(eq(portfolioProjects.artistId, id)),
    db.select().from(artistLinks).where(eq(artistLinks.artistId, id)),
    db.select().from(commissions).where(eq(commissions.artistId, id)),
  ]);

  const projectIds = projects.map((p) => p.id);
  const assets = projectIds.length
    ? await db
        .select()
        .from(portfolioAssets)
        .where(inArray(portfolioAssets.projectId, projectIds))
    : [];

  const comIds = coms.map((x) => x.id);
  let quoteRows: unknown[] = [];
  let fileRows: unknown[] = [];
  let deliveryRows: unknown[] = [];
  let threadRows: { id: string }[] = [];
  let revisionRows: unknown[] = [];
  let messageRows: unknown[] = [];
  if (comIds.length) {
    [quoteRows, fileRows, deliveryRows, threadRows, revisionRows] =
      await Promise.all([
        db.select().from(quotes).where(inArray(quotes.commissionId, comIds)),
        db
          .select({
            id: files.id,
            commissionId: files.commissionId,
            kind: files.kind,
            name: files.name,
            sizeBytes: files.sizeBytes,
            createdAt: files.createdAt,
          })
          .from(files)
          .where(inArray(files.commissionId, comIds)),
        db
          .select()
          .from(deliveries)
          .where(inArray(deliveries.commissionId, comIds)),
        db
          .select({ id: portalThreads.id })
          .from(portalThreads)
          .where(inArray(portalThreads.commissionId, comIds)),
        db
          .select()
          .from(revisionRounds)
          .where(inArray(revisionRounds.commissionId, comIds)),
      ]);
    const threadIds = threadRows.map((t) => t.id);
    messageRows = threadIds.length
      ? await db
          .select()
          .from(portalMessages)
          .where(inArray(portalMessages.threadId, threadIds))
      : [];
  }

  const payload = {
    exportedAt: new Date().toISOString(),
    profile: artist,
    commissionTypes: types,
    portfolio: { projects, assets },
    links,
    commissions: coms,
    quotes: quoteRows,
    files: fileRows,
    deliveries: deliveryRows,
    threads: threadRows,
    messages: messageRows,
    revisions: revisionRows,
  };
  audit("data_export", { artistId: id });
  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      "content-type": "application/json",
      "content-disposition": `attachment; filename="mirae-export.json"`,
    },
  });
});

// DELETE /api/artists/me — permanently delete the account and all data.
// Deleting the auth user cascades to the artist profile and everything under
// it (commissions, portfolio, links, quotes, files, threads, …); sessions and
// accounts are cleared explicitly first.
artistsRoutes.delete("/me", async (c) => {
  const artist = await getArtist(c);
  if (!artist) return c.json({ error: "unauthorized" }, 401);
  const db = createDb(c.env.DATABASE_URL);
  await db.delete(sessions).where(eq(sessions.userId, artist.userId));
  await db.delete(accounts).where(eq(accounts.userId, artist.userId));
  await db.delete(users).where(eq(users.id, artist.userId));
  audit("account_deleted", { artistId: artist.id });
  return c.json({ ok: true });
});

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
