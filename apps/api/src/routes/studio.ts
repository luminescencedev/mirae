import { Hono } from "hono";
import { and, asc, eq, inArray } from "drizzle-orm";
import {
  artistProfiles,
  commissionRequests,
  commissionTypes,
  createDb,
  portfolioAssets,
  portfolioProjects,
  users,
} from "@mirae/db";
import { type AuthEnv } from "../auth.ts";
import { mailLayout, sendEmail } from "../lib/mail.ts";

type Bindings = AuthEnv & { ASSETS: Fetcher; FILES: R2Bucket };

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

  // Published portfolio projects (+ their assets), portfolio-first ordering.
  const projects = await db
    .select()
    .from(portfolioProjects)
    .where(
      and(
        eq(portfolioProjects.artistId, profile.id),
        eq(portfolioProjects.visibility, "published"),
      ),
    )
    .orderBy(asc(portfolioProjects.position));
  const projectIds = projects.map((p) => p.id);
  const assets = projectIds.length
    ? await db
        .select()
        .from(portfolioAssets)
        .where(inArray(portfolioAssets.projectId, projectIds))
        .orderBy(asc(portfolioAssets.position))
    : [];
  const assetsByProject = new Map<string, typeof assets>();
  for (const a of assets) {
    const list = assetsByProject.get(a.projectId) ?? [];
    list.push(a);
    assetsByProject.set(a.projectId, list);
  }
  const publicProjects = projects.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    description: p.description,
    projectType: p.projectType,
    featured: p.featured,
    assets: (assetsByProject.get(p.id) ?? []).map((a) => ({
      id: a.id,
      altText: a.altText,
      width: a.width,
      height: a.height,
      blurData: a.blurData,
      url: `/api/portfolio/assets/${a.id}/raw`,
    })),
  }));

  return c.json({
    profile: {
      handle: profile.handle,
      displayName: profile.displayName,
      tagline: profile.tagline,
      bio: profile.bio,
      status: profile.status,
      avatarUrl: profile.avatarR2Key
        ? `/api/studio/${profile.handle}/avatar`
        : null,
      coverUrl: profile.coverR2Key
        ? `/api/studio/${profile.handle}/cover`
        : null,
    },
    commissionTypes: types,
    projects: publicProjects,
    featuredProjectId: publicProjects.find((p) => p.featured)?.id ?? null,
  });
});

// GET /api/studio/:handle/avatar|cover — public profile media stream.
studioRoutes.get("/:handle/:kind{avatar|cover}", async (c) => {
  const handle = c.req.param("handle").replace(/^@/, "").trim().toLowerCase();
  const kind = c.req.param("kind");
  const db = createDb(c.env.DATABASE_URL);
  const [profile] = await db
    .select({
      avatarR2Key: artistProfiles.avatarR2Key,
      coverR2Key: artistProfiles.coverR2Key,
    })
    .from(artistProfiles)
    .where(eq(artistProfiles.handle, handle))
    .limit(1);
  const key = kind === "avatar" ? profile?.avatarR2Key : profile?.coverR2Key;
  if (!key) return c.json({ error: "not found" }, 404);
  const obj = await c.env.FILES.get(key);
  if (!obj) return c.json({ error: "not found" }, 404);
  return new Response(obj.body, {
    headers: {
      "content-type": obj.httpMetadata?.contentType ?? "image/jpeg",
      "cache-control": "public, max-age=3600",
    },
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

  // Notify the artist by email (best-effort).
  const [account] = await db
    .select({ email: users.email })
    .from(users)
    .where(eq(users.id, profile.userId))
    .limit(1);
  if (account?.email) {
    await sendEmail(c.env, {
      to: account.email,
      subject: `New commission request from ${clientName}`,
      html: mailLayout(
        "New commission request",
        `<strong>${clientName}</strong> (${clientEmail}) sent a request${budget ? ` · budget ${budget}` : ""}.<br/><br/>${brief}`,
        {
          label: "Open your inbox",
          url: `${c.env.BETTER_AUTH_URL}/app/requests`,
        },
      ),
    });
  }

  return c.json({ ok: true, id: row.id }, 201);
});
