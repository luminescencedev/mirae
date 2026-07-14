# Operations: backup, recovery & incident response

Operational runbook for Mirae in production. Pairs with
[`SECURITY.md`](./SECURITY.md) and [`DECISIONS.md`](../decisions/DECISIONS.md).

## Production topology

- **Worker** — single Cloudflare Worker (`mirae`), serves the SPA + Hono API on
  `usemirae.com` and `app.usemirae.com`. Deployed manually with
  `pnpm build && npx wrangler deploy --config apps/api/wrangler.toml`.
- **Database** — Neon serverless Postgres (`neondb`).
- **Object storage** — Cloudflare R2 bucket `mirae-files` (portfolio, avatars,
  covers, commission files).
- **Email** — Resend (notifications; no-ops when unset).
- **Secrets** — `BETTER_AUTH_SECRET`, `DATABASE_URL`, `RESEND_API_KEY`,
  `MAIL_FROM` set as Worker secrets (never committed; local dev uses
  `apps/api/.dev.vars`, gitignored).

## Backup & recovery (TRUST-019)

### Database (Neon)

- **Point-in-time restore** — Neon retains WAL history; restore to any instant
  within the retention window from the Neon console (Branches → Restore). Verify
  the retention window matches the current plan and raise it before beta if
  needed.
- **Schema** — every change is a committed, versioned Drizzle migration under
  `packages/db/drizzle`. A fresh database is rebuilt with `pnpm db:migrate`.
- **Recovery drill** — periodically branch the production database in Neon,
  point a local `wrangler dev` at the branch, and confirm the app boots + reads
  data. A branch is a zero-copy, disposable clone — safe to test against.

### Object storage (R2)

- R2 objects are keyed and referenced from the DB (`files.key`,
  `portfolio_assets.r2_key`, `artist_profiles.avatar/cover_r2_key`,
  `commission_types.image_r2_key`). The daily orphan sweep (`cleanup.ts`) removes
  unreferenced objects; it never deletes referenced ones.
- **Before enabling destructive lifecycle rules**, enable R2 object versioning
  (or a scheduled copy to a second bucket) so an accidental delete is
  recoverable.

### Recovery order (full outage)

1. Restore/verify the Neon database (PITR or latest good branch).
2. Confirm R2 bucket + bindings are intact.
3. Re-set Worker secrets if the Worker was recreated.
4. `pnpm build && wrangler deploy`.
5. Run `pnpm smoke` (BASE_URL = prod) to confirm health.

## Incident response (TRUST-020)

_Added in TRUST-020 below._
