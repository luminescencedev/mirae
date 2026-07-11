import { Hono } from "hono";
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
import { isSocialBot, renderStudioOg } from "./lib/og.ts";

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
app.get("/api/health", (c) => c.json({ status: "ok" }));

// Better Auth — handles /api/auth/* (sign-up, sign-in, session, …).
app.on(["GET", "POST"], "/api/auth/*", (c) =>
  makeAuth(c.env).handler(c.req.raw),
);

// Public waitlist capture (landing page, no auth).
app.post("/api/waitlist", async (c) => {
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

// Social crawlers hitting /@handle get a server-rendered Open Graph document
// (nice link unfurls in Discord/Twitter/etc.); humans fall through to the SPA.
app.get("/:handle", async (c) => {
  const raw = c.req.param("handle");
  if (!raw.startsWith("@") || !isSocialBot(c.req.header("user-agent"))) {
    return serveSpa(c);
  }
  const handle = raw.slice(1).toLowerCase();
  const db = createDb(c.env.DATABASE_URL);
  const [profile] = await db
    .select()
    .from(artistProfiles)
    .where(eq(artistProfiles.handle, handle))
    .limit(1);
  // Unknown handle → let the SPA render its own not-found page.
  if (!profile) return serveSpa(c);
  return c.html(renderStudioOg(profile, new URL(c.req.url).origin));
});

// SPA fallback: anything not handled above (and not an /api route) is served
// from the static assets binding — the built Vite app in apps/web/dist.
app.all("*", (c) => serveSpa(c));

export default app;
