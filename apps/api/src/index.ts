import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { eq } from "drizzle-orm";
import { artistProfiles, createDb, waitlist } from "@mirae/db";
import { makeAuth, type AuthEnv } from "./auth.ts";
import { artistsRoutes } from "./routes/artists.ts";
import { commissionTypesRoutes } from "./routes/commission-types.ts";
import { studioRoutes } from "./routes/studio.ts";
import { requestsRoutes } from "./routes/requests.ts";
import { commissionsRoutes } from "./routes/commissions.ts";
import { portalRoutes } from "./routes/portal.ts";
import { deliveryRoutes } from "./routes/delivery.ts";
import { portfolioRoutes } from "./routes/portfolio.ts";
import { linksRoutes } from "./routes/links.ts";
import { analyticsRoutes } from "./routes/analytics.ts";
import { feedbackRoutes } from "./routes/feedback.ts";
import { injectStudioMeta } from "./lib/og.ts";
import { studioOgResponse } from "./lib/og-card.ts";
import { sweepOrphans } from "./lib/cleanup.ts";
import { rateLimit } from "./lib/rate-limit.ts";
import { log, serializeError } from "./lib/log.ts";

type Bindings = AuthEnv & {
  ASSETS: Fetcher;
  FILES: R2Bucket;
};

const app = new Hono<{ Bindings: Bindings }>();

// Paths that belong to the dashboard host (app.usemirae.com): the app itself
// plus auth/onboarding. Everything else (landing, /@handle, /portal,
// /delivery) belongs to the marketing host (usemirae.com).
const APP_PATH = /^\/(app|login|signup|onboarding)(\/|$)/;

// Split the two production hosts. In dev / on *.workers.dev there is no split,
// so every route is served by path on the same origin (returns null).
function hostSplitRedirect(req: Request): Response | null {
  const url = new URL(req.url);
  const host = url.hostname;
  const isApp = host === "app.usemirae.com";
  const isMarketing = host === "usemirae.com" || host === "www.usemirae.com";
  if (!isApp && !isMarketing) return null;
  if (req.method !== "GET" || url.pathname.includes(".")) return null; // assets

  const onAppPath = APP_PATH.test(url.pathname);
  if (isApp) {
    // Dashboard host: root → the app; anything non-app → the marketing site.
    if (url.pathname === "/")
      return Response.redirect("https://app.usemirae.com/app", 302);
    if (!onAppPath)
      return Response.redirect(
        `https://usemirae.com${url.pathname}${url.search}`,
        302,
      );
  } else if (onAppPath) {
    // Marketing host: app/auth paths live on the dashboard host.
    return Response.redirect(
      `https://app.usemirae.com${url.pathname}${url.search}`,
      302,
    );
  }
  return null;
}

// Serve a static asset; for client-side routes with no matching file (e.g.
// /@handle, /login, /app/*) fall back to index.html so the SPA can boot.
// `run_worker_first` means the Worker sees every request, so we own this.
async function serveSpa(c: { env: Bindings; req: { raw: Request } }) {
  const redirect = hostSplitRedirect(c.req.raw);
  if (redirect) return redirect;
  const res = await c.env.ASSETS.fetch(c.req.raw);
  if (res.status !== 404 || c.req.raw.method !== "GET") return res;
  const url = new URL(c.req.raw.url);
  url.pathname = "/";
  return c.env.ASSETS.fetch(new Request(url, { headers: c.req.raw.headers }));
}

// Health check — hit directly on the Worker (wrangler dev: :8787/health).
app.get("/health", (c) => c.json({ status: "ok" }));

// robots.txt — allow public pages, keep the app/API/private tokens out.
app.get("/robots.txt", (c) => {
  const origin = new URL(c.req.url).origin;
  const body = [
    "User-agent: *",
    "Allow: /",
    "Disallow: /app",
    "Disallow: /api",
    "Disallow: /portal",
    "Disallow: /delivery",
    "Disallow: /login",
    "Disallow: /signup",
    "Disallow: /onboarding",
    "",
    `Sitemap: ${origin}/sitemap.xml`,
    "",
  ].join("\n");
  return c.body(body, 200, { "content-type": "text/plain; charset=utf-8" });
});

// sitemap.xml — the landing page + every indexable (non-closed) studio.
app.get("/sitemap.xml", async (c) => {
  const origin = new URL(c.req.url).origin;
  const db = createDb(c.env.DATABASE_URL);
  const rows = await db
    .select({
      handle: artistProfiles.handle,
      status: artistProfiles.status,
      updatedAt: artistProfiles.updatedAt,
    })
    .from(artistProfiles);
  const urls = [
    `<url><loc>${origin}/</loc></url>`,
    ...rows
      .filter((r) => r.status !== "closed")
      .map(
        (r) =>
          `<url><loc>${origin}/@${r.handle}</loc><lastmod>${new Date(
            r.updatedAt,
          ).toISOString()}</lastmod></url>`,
      ),
  ].join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
  return c.body(xml, 200, {
    "content-type": "application/xml; charset=utf-8",
    "cache-control": "public, max-age=3600",
  });
});
app.get("/api/health", (c) => c.json({ status: "ok" }));

// Better Auth — handles /api/auth/* (sign-up, sign-in, session, …).
app.on(["GET", "POST"], "/api/auth/*", (c) =>
  makeAuth(c.env).handler(c.req.raw),
);

// Public waitlist capture (landing page, no auth).
app.post("/api/waitlist", rateLimit(), async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as { email?: unknown };
  const email = String(body.email ?? "")
    .trim()
    .toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return c.json({ error: "A valid email is required." }, 400);
  const db = createDb(c.env.DATABASE_URL);
  // Ignore duplicates — signing up twice is a no-op success.
  await db.insert(waitlist).values({ email }).onConflictDoNothing();
  return c.json({ ok: true }, 201);
});

// Client crash reports from the SPA error boundary + global handlers. Logged
// as structured JSON; the browser fires these via sendBeacon (no auth), so
// treat the body as untrusted and clamp field sizes.
app.post("/api/client-errors", rateLimit(), async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as Record<
    string,
    unknown
  >;
  const str = (v: unknown, max: number) =>
    typeof v === "string" ? v.slice(0, max) : undefined;
  log("error", "client_error", {
    scope: str(body.scope, 32) ?? "unknown",
    message: str(body.message, 1000) ?? "",
    stack: str(body.stack, 4000),
    componentStack: str(body.componentStack, 4000),
    url: str(body.url, 500),
    userAgent: c.req.header("user-agent"),
  });
  return c.body(null, 204);
});

// Artist profile (onboarding + /me).
app.route("/api/artists", artistsRoutes);
// Commission types CRUD (the artist's public offerings).
app.route("/api/commission-types", commissionTypesRoutes);
// Public studio page payload by handle (no auth).
app.route("/api/studio", studioRoutes);
// The signed-in artist's request inbox.
app.route("/api/requests", requestsRoutes);
// The signed-in artist's commissions.
app.route("/api/commissions", commissionsRoutes);
// Public client portal (token-addressed, no auth).
app.route("/api/portal", portalRoutes);
// Public delivery page (token-addressed, no auth).
app.route("/api/delivery", deliveryRoutes);
// Portfolio projects + assets (owner-scoped CRUD; public image stream).
app.route("/api/portfolio", portfolioRoutes);
// Artist links (link-in-bio) — owner-scoped CRUD + public click counter.
app.route("/api/artist-links", linksRoutes);
// Studio insights (owner-scoped, privacy-friendly analytics).
app.route("/api/analytics", analyticsRoutes);
// In-app beta feedback (owner-scoped).
app.route("/api/feedback", feedbackRoutes);

// Branded OG social card (PNG, 1200×630) for a studio. Public + cacheable;
// referenced by og:image on /@handle. Versioned via ?v so scrapers refetch.
app.get("/og/studio/:handle", async (c) => {
  const handle = c.req.param("handle").toLowerCase();
  const db = createDb(c.env.DATABASE_URL);
  const [profile] = await db
    .select()
    .from(artistProfiles)
    .where(eq(artistProfiles.handle, handle))
    .limit(1);
  if (!profile) return c.notFound();
  try {
    return await studioOgResponse(c.env.FILES, profile);
  } catch (err) {
    // Never leave og:image broken — fall back to a plain image.
    log("warn", "og_card_failed", { handle, error: serializeError(err) });
    const origin = new URL(c.req.url).origin;
    const fallback = profile.coverR2Key
      ? `${origin}/api/studio/${handle}/cover`
      : profile.avatarR2Key
        ? `${origin}/api/studio/${handle}/avatar`
        : `${origin}/og-default.png`;
    return c.redirect(fallback, 302);
  }
});

// Public studio pages (/@handle): serve the real SPA index.html with per-studio
// SEO + Open Graph metadata injected, so humans boot the app and crawlers /
// social scrapers get correct head tags (title, description, canonical, OG,
// Twitter, JSON-LD; noindex for closed studios). No cloaking.
app.get("/:handle", async (c) => {
  const raw = c.req.param("handle");
  if (!raw.startsWith("@") || c.req.method !== "GET") return serveSpa(c);
  const handle = raw.slice(1).toLowerCase();
  const db = createDb(c.env.DATABASE_URL);
  const [profile] = await db
    .select()
    .from(artistProfiles)
    .where(eq(artistProfiles.handle, handle))
    .limit(1);
  // Unknown handle → let the SPA render its own not-found page.
  if (!profile) return serveSpa(c);

  const url = new URL(c.req.url);
  url.pathname = "/";
  const res = await c.env.ASSETS.fetch(
    new Request(url, { headers: c.req.raw.headers }),
  );
  const baseHtml = await res.text();
  const html = injectStudioMeta(baseHtml, profile, new URL(c.req.url).origin);
  return c.html(html);
});

// SPA fallback: anything not handled above (and not an /api route) is served
// from the static assets binding — the built Vite app in apps/web/dist.
app.all("*", (c) => serveSpa(c));

// Central error logging. Explicit handler errors are returned inline as
// `{ error }` by the routes; this only fires on *unexpected* throws (DB
// failures, bugs). Expected HTTPExceptions keep their intended response.
app.onError((err, c) => {
  const path = new URL(c.req.url).pathname;
  if (err instanceof HTTPException) {
    log("warn", "http_exception", {
      method: c.req.method,
      path,
      status: err.status,
      ...serializeError(err),
    });
    return err.getResponse();
  }
  log("error", "unhandled_error", {
    method: c.req.method,
    path,
    ...serializeError(err),
  });
  return c.json({ error: "Internal server error" }, 500);
});

// Export a module worker so we can attach the scheduled (cron) handler that
// sweeps orphaned R2 objects. `fetch` stays the Hono app.
export default {
  fetch: app.fetch,
  async scheduled(
    _event: ScheduledEvent,
    env: Parameters<typeof app.fetch>[1] & {
      DATABASE_URL: string;
      FILES: R2Bucket;
    },
    ctx: ExecutionContext,
  ) {
    ctx.waitUntil(
      sweepOrphans(env)
        .then((n) => log("info", "orphan_sweep", { deleted: n }))
        .catch((e) => log("error", "orphan_sweep_failed", serializeError(e))),
    );
  },
};
