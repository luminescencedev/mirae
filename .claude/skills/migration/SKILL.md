---
name: migration
description: Evolve the Mirae PostgreSQL schema cleanly with Drizzle against Neon — edit the schema files, generate a versioned SQL migration, review it, apply it to the Neon branch, and keep enums in sync with packages/shared. Use for any table/column/index/enum change.
---

# Skill: migration — change the DB schema without breaking things

The schema is the **source of truth**: `packages/db/src/schema/*` (one file per table, re-exported from `schema/index.ts`). Never edit the database by hand. See `docs/architecture/DATABASE.md`.

## 1. Edit the schema

- Add/change tables in `packages/db/src/schema/<table>.ts`; re-export from `schema/index.ts`.
- Expose row types (`$inferSelect` / `$inferInsert`) from `packages/db/src/index.ts`.
- Conventions: UUID PKs, `created_at`/`updated_at` on every table, money as integer minor units (cents), explicit FKs.
- **Enums**: Postgres enum values must mirror `packages/shared/src/constants/*` (commission / request / studio statuses). Change both together.

## 2. Generate the versioned migration

```bash
pnpm db:generate        # drizzle-kit — writes packages/db/drizzle/NNNN_*.sql + snapshot
```

- **Read the generated SQL** — that's what runs.
- **Never hand-edit** an already-generated migration; re-run generate instead.
- **Commit** the migration (it's versioned in git).

## 3. Apply to the Neon dev branch

```bash
pnpm db:migrate         # applies against DATABASE_URL (Neon dev branch in .env)
```

No local Docker Postgres — Mirae develops against a real Neon branch because prod uses the Neon serverless HTTP driver (Workers can't open raw TCP). `pnpm db:studio` to inspect.

## 4. Verify

```bash
pnpm typecheck
```

Plus exercise the affected query path if a seed/route uses it.

## Gotchas

- No `db:migrate` without `db:generate` first (the versioned migration would be missing).
- `NOT NULL` on an already-populated table breaks — add a default or backfill.
- Never swap `@neondatabase/serverless` for `pg`/`postgres.js` (raw TCP, impossible on Workers — locked in `docs/decisions/DECISIONS.md`).
