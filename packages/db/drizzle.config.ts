import { defineConfig } from "drizzle-kit";

// Migrations run against the Neon dev branch (DATABASE_URL in .env). No local
// Docker Postgres — see docs/DATABASE.md. Not part of the src typecheck.
export default defineConfig({
  schema: "./src/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
});
