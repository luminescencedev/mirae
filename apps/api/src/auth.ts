import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createDb, schema } from "@mirae/db";

export type AuthEnv = {
  DATABASE_URL: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  // Optional — notification emails no-op when unset (see lib/mail.ts).
  RESEND_API_KEY?: string;
  MAIL_FROM?: string;
};

// Better Auth is built per request (Workers have no long-lived globals; env
// is request-scoped). Drizzle adapter over Neon, email + password to start.
export function makeAuth(env: AuthEnv) {
  const db = createDb(env.DATABASE_URL);
  const secureCookies = env.BETTER_AUTH_URL.startsWith("https://");
  return betterAuth({
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    trustedOrigins: [env.BETTER_AUTH_URL],
    database: drizzleAdapter(db, {
      provider: "pg",
      usePlural: true,
      schema,
    }),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 10,
      maxPasswordLength: 128,
    },
    // 30-day rolling sessions, refreshed at most once a day.
    session: {
      expiresIn: 60 * 60 * 24 * 30,
      updateAge: 60 * 60 * 24,
    },
    // Throttle auth endpoints (login/signup/reset) against brute force.
    rateLimit: {
      enabled: true,
      window: 60,
      max: 20,
    },
    advanced: {
      // Secure, httpOnly cookies over HTTPS; cross-subdomain so app. + apex
      // share the session (both are usemirae.com).
      useSecureCookies: secureCookies,
      defaultCookieAttributes: {
        httpOnly: true,
        sameSite: "lax",
        secure: secureCookies,
      },
    },
  });
}
