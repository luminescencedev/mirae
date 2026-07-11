import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { artistProfiles, createDb } from "@mirae/db";
import { makeAuth, type AuthEnv } from "./auth.ts";
import { artistsRoutes } from "./routes/artists.ts";
import { commissionTypesRoutes } from "./routes/commission-types.ts";
import { studioRoutes } from "./routes/studio.ts";
import { isSocialBot, renderStudioOg } from "./lib/og.ts";

type Bindings = AuthEnv & {
  ASSETS: Fetcher;
};

const app = new Hono<{ Bindings: Bindings }>();

// Serve a static asset; for client-side routes with no matching file (e.g.
// /@handle, /login, /app/*) fall back to index.html so the SPA can boot.
// `run_worker_first` means the Worker sees every request, so we own this.
async function serveSpa(c: { env: Bindings; req: { raw: Request } }) {
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

// Artist profile (onboarding + /me).
app.route("/api/artists", artistsRoutes);
// Commission types CRUD (the artist's public offerings).
app.route("/api/commission-types", commissionTypesRoutes);
// Public studio page payload by handle (no auth).
app.route("/api/studio", studioRoutes);

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
