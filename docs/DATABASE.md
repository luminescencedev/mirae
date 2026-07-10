# Database

> Canonical source for the data model, Neon + Drizzle conventions, and migrations.

## Provider — Neon (serverless driver)

PostgreSQL via **Neon**, accessed through the `@neondatabase/serverless` HTTP/WebSocket driver. This is **required**, not a preference: Cloudflare Workers cannot open raw TCP connections, so `pg`/`postgres.js` will not work in production. Do not swap the driver.

Local dev DB = a dedicated **Neon branch** (created once in Sprint 3), referenced via `.env`. No local Docker Postgres — developing against real Neon avoids driver-behavior mismatch between local and prod. Neon instant branching also lets each preview/ticket get an isolated disposable DB if useful later.

## ORM — Drizzle

- Schema: `packages/db/src/schema/`, one file per table, re-exported from `schema/index.ts`.
- Client: `packages/db/src/client.ts` — Neon serverless + Drizzle.
- Config: `packages/db/drizzle.config.ts`.
- Seed: `packages/db/src/seed/seed-dev.ts`.
- Pins: `drizzle-orm 0.45.2`, `drizzle-kit 0.31.10` (dev), `@neondatabase/serverless 1.1.0`.
- Migrations generated with `drizzle-kit`; run against the Neon dev branch via `pnpm db:migrate`, seed via `pnpm db:seed`.

## MVP tables

```txt
users
artist_profiles
clients
commission_types
commission_requests
commissions
quotes
quote_items
files
deliveries
activity_logs
```

## Future tables (post-MVP)

```txt
subscriptions payments invoices custom_forms form_fields
revision_requests waitlist_entries studio_page_blocks
```

## Enums / status values

Commission status:

```txt
new_request quote_sent waiting_deposit queued sketch review revision final delivered archived
```

Request status:

```txt
new accepted declined converted archived
```

Studio commission status:

```txt
open closed waitlist
```

## Relationships (high level)

```txt
users            1─1  artist_profiles
artist_profiles  1─n  commission_types
artist_profiles  1─n  clients
artist_profiles  1─n  commission_requests
commission_requests 1─1 commissions        (on convert)
commissions      1─n  quotes
quotes           1─n  quote_items
commissions      1─n  files
commissions      1─1  deliveries           (token-addressed)
commissions      1─n  activity_logs
```

Tokens: client portal (`/portal/:token`) and delivery (`/delivery/:token`) are accessed without login via opaque tokens tied to a commission.

## Conventions

- UUID primary keys.
- `created_at` / `updated_at` timestamps on all tables.
- Foreign keys explicit; cascade rules decided per table when schema is written (Sprint 3, DB-002).
- Money stored as integer minor units (cents) — never floats.
- Status columns are Postgres enums mirroring the lists above; keep enum values in sync with `packages/shared/src/constants/commission-status.ts`.
