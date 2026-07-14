import { Hono } from "hono";
import { and, asc, eq, inArray } from "drizzle-orm";
import {
  artistLinks,
  artistProfiles,
  commissionRequests,
  commissionTypes,
  createDb,
  portfolioAssets,
  portfolioProjects,
  studioEvents,
  users,
} from "@mirae/db";
import { normalizeAppearance, normalizeFaq } from "@mirae/shared";
import { type AuthEnv } from "../auth.ts";
import { rateLimit } from "../lib/rate-limit.ts";
import { mailLayout, sendEmail } from "../lib/mail.ts";

type Bindings = AuthEnv & { ASSETS: Fetcher; FILES: R2Bucket };

export const studioRoutes = new Hono<{ Bindings: Bindings }>();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const EVENT_TYPES = new Set([
  "view",
  "link_click",
  "request_start",
  "request_submit",
]);

// Daily-rotating visitor hash (privacy-friendly unique-view estimate). The IP
// and UA are hashed with the day + a salt and never stored raw.
async function sessionHashFor(ip: string, ua: string): Promise<string> {
  const day = new Date().toISOString().slice(0, 10);
  const data = new TextEncoder().encode(`${ip}|${ua}|${day}|mirae-analytics`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 32);
}

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
  const publicProjects = projects.map((p) => {
    // Lead with the chosen cover asset, keeping the rest in position order.
    const projectAssets = assetsByProject.get(p.id) ?? [];
    const ordered = p.coverAssetId
      ? [...projectAssets].sort(
          (a, b) =>
            (b.id === p.coverAssetId ? 1 : 0) -
            (a.id === p.coverAssetId ? 1 : 0),
        )
      : projectAssets;
    return {
      id: p.id,
      title: p.title,
      slug: p.slug,
      description: p.description,
      projectType: p.projectType,
      featured: p.featured,
      assets: ordered.map((a) => ({
        id: a.id,
        altText: a.altText,
        width: a.width,
        height: a.height,
        blurData: a.blurData,
        url: `/api/portfolio/assets/${a.id}/raw`,
      })),
    };
  });

  // Enabled links (link-in-bio), ordered.
  const links = await db
    .select({
      id: artistLinks.id,
      title: artistLinks.title,
      url: artistLinks.url,
      platform: artistLinks.platform,
      type: artistLinks.type,
      style: artistLinks.style,
      featured: artistLinks.featured,
    })
    .from(artistLinks)
    .where(
      and(eq(artistLinks.artistId, profile.id), eq(artistLinks.enabled, true)),
    )
    .orderBy(asc(artistLinks.position));

  return c.json({
    profile: {
      handle: profile.handle,
      displayName: profile.displayName,
      tagline: profile.tagline,
      bio: profile.bio,
      about: profile.about,
      faq: normalizeFaq(profile.faq),
      status: profile.status,
      avatarUrl: profile.avatarR2Key
        ? `/api/studio/${profile.handle}/avatar`
        : null,
      coverUrl: profile.coverR2Key
        ? `/api/studio/${profile.handle}/cover`
        : null,
    },
    commissionTypes: types.map((t) => ({
      id: t.id,
      name: t.name,
      blurb: t.blurb,
      priceFromCents: t.priceFromCents,
      turnaround: t.turnaround,
      slots: t.slots,
      imageUrl: t.imageR2Key ? `/api/commission-types/${t.id}/image` : null,
    })),
    projects: publicProjects,
    featuredProjectId: publicProjects.find((p) => p.featured)?.id ?? null,
    links,
    appearance: normalizeAppearance(profile.appearance),
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
      "x-content-type-options": "nosniff",
    },
  });
});

// POST /api/studio/:handle/requests — submit a commission request (PUBLIC, no
// account needed). Creates a commission_requests row for the studio.
studioRoutes.post("/:handle/requests", rateLimit(), async (c) => {
  const handle = (c.req.param("handle") ?? "")
    .replace(/^@/, "")
    .trim()
    .toLowerCase();
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

// POST /api/studio/:handle/events — record a privacy-friendly public event
// (view, link_click, request_start, request_submit). No auth, no cookies.
studioRoutes.post("/:handle/events", async (c) => {
  const handle = c.req.param("handle").replace(/^@/, "").trim().toLowerCase();
  const body = (await c.req.json().catch(() => ({}))) as {
    type?: unknown;
    linkId?: unknown;
    ref?: unknown;
  };
  const type = String(body.type ?? "");
  if (!EVENT_TYPES.has(type)) return c.json({ error: "bad type" }, 400);

  const db = createDb(c.env.DATABASE_URL);
  const [profile] = await db
    .select({ id: artistProfiles.id })
    .from(artistProfiles)
    .where(eq(artistProfiles.handle, handle))
    .limit(1);
  if (!profile) return c.json({ error: "not found" }, 404);

  let sessionHash: string | null = null;
  if (type === "view") {
    sessionHash = await sessionHashFor(
      c.req.header("cf-connecting-ip") ?? "",
      c.req.header("user-agent") ?? "",
    );
  }
  let refHost: string | null = null;
  if (typeof body.ref === "string" && body.ref) {
    try {
      refHost = new URL(body.ref).hostname || null;
    } catch {
      refHost = null;
    }
  }
  const linkId = typeof body.linkId === "string" ? body.linkId : null;

  await db.insert(studioEvents).values({
    artistId: profile.id,
    type,
    linkId,
    sessionHash,
    refHost,
  });
  return c.body(null, 204);
});
