import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createDb, schema } from "@mirae/db";

export type AuthEnv = {
  DATABASE_URL: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
};

// Better Auth is built per request (Workers have no long-lived globals; env
// is request-scoped). Drizzle adapter over Neon, email + password to start.
export function makeAuth(env: AuthEnv) {
  const db = createDb(env.DATABASE_URL);
  return betterAuth({
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    trustedOrigins: [env.BETTER_AUTH_URL],
    database: drizzleAdapter(db, {
      provider: "pg",
      usePlural: true,
      schema,
    }),
    emailAndPassword: { enabled: true },
  });
}
