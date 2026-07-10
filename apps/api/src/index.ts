import { Hono } from "hono";

type Bindings = {
  ASSETS: Fetcher;
};

const app = new Hono<{ Bindings: Bindings }>();

// Health check — hit directly on the Worker (wrangler dev: :8787/health).
app.get("/health", (c) => c.json({ status: "ok" }));

// API surface lives under /api/*. Real routes are mounted in later tickets.
app.get("/api/health", (c) => c.json({ status: "ok" }));

// SPA fallback: anything not handled above (and not an /api route) is served
// from the static assets binding — the built Vite app in apps/web/dist.
// The /@:handle OG bot-detection handler will slot in ahead of this later.
app.all("*", (c) => c.env.ASSETS.fetch(c.req.raw));

export default app;
