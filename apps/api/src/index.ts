import { Hono } from "hono";
import { makeAuth, type AuthEnv } from "./auth.ts";
import { artistsRoutes } from "./routes/artists.ts";
import { commissionTypesRoutes } from "./routes/commission-types.ts";

type Bindings = AuthEnv & {
  ASSETS: Fetcher;
};

const app = new Hono<{ Bindings: Bindings }>();

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

// SPA fallback: anything not handled above (and not an /api route) is served
// from the static assets binding — the built Vite app in apps/web/dist.
// The /@:handle OG bot-detection handler will slot in ahead of this later.
app.all("*", (c) => c.env.ASSETS.fetch(c.req.raw));

export default app;
