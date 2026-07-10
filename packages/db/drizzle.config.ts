import { fileURLToPath } from "node:url";
import { loadEnvFile } from "node:process";
import { defineConfig } from "drizzle-kit";

// Load the repo-root .env (drizzle-kit doesn't read it automatically).
// Migrations run against the Neon dev branch (DATABASE_URL). See docs/DATABASE.md.
try {
  loadEnvFile(fileURLToPath(new URL("../../.env", import.meta.url)));
} catch {
  // .env absent (e.g. CI) — DATABASE_URL is expected in the environment.
}

export default defineConfig({
  schema: "./src/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
});
