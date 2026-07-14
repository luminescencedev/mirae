// Rate-limit middleware, keyed by client IP + route. Uses Cloudflare's native
// rate-limiting binding (`RATE_LIMITER`) when present; if the binding isn't
// configured it no-ops so local dev and un-provisioned environments still work.
//
// To activate in production, add to apps/api/wrangler.toml:
//   [[unsafe.bindings]]
//   name = "RATE_LIMITER"
//   type = "ratelimit"
//   namespace_id = "1001"
//   simple = { limit = 20, period = 60 }
// (see docs/architecture/SECURITY.md).

import type { Context, Next } from "hono";

type RateLimiter = { limit(o: { key: string }): Promise<{ success: boolean }> };

export function rateLimit() {
  return async (c: Context, next: Next) => {
    const limiter = (c.env as { RATE_LIMITER?: RateLimiter }).RATE_LIMITER;
    if (limiter) {
      const ip = c.req.header("cf-connecting-ip") ?? "anon";
      const { success } = await limiter.limit({
        key: `${new URL(c.req.url).pathname}:${ip}`,
      });
      if (!success)
        return c.json(
          { error: "Too many requests. Please slow down and try again." },
          429,
        );
    }
    return next();
  };
}
