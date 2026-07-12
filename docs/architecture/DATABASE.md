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

## Planned post-MVP schema (NOT yet implemented)

> These tables/columns are **planned** for the next cycle (Sprints 12+). No migrations exist yet — do not treat as live. Full field lists + API in [`DATA_AND_API_EXTENSION.md`](DATA_AND_API_EXTENSION.md); product intent in [`PUBLIC_STUDIO_SPEC.md`](../product/PUBLIC_STUDIO_SPEC.md). Migration strategy: add nullable fields + new tables first, keep the current public response compatible, deploy backend before switching public UI, never force existing artists to backfill.

Planned tables:

- **`portfolio_projects`** — artist work grouped into projects (title, slug, description, `project_type` enum, `visibility` draft/published/archived, position, featured). Owner-scoped; public reads return published only.
- **`portfolio_assets`** — images per project (R2 key, mime, width/height, size, alt text, position, blur placeholder). Deleting a project removes rows **and** R2 objects (retryable cleanup).
- **`artist_links`** — link-in-bio hub (title, url, `platform`, `type` social/shop/support/video/stream/newsletter/contact/custom, `style` simple/card/media/featured, position, featured, enabled). URLs `https`-only, normalized, sanitized.
- **`studio_appearance`** — curated customization (`draft_config_json` + `published_config_json`): accent/typography/hero/portfolio layout/image radius/section order/visibility. Allowed values **server-validated**.
- **`request_assets`** — public request reference uploads under a short-lived upload token (R2 key, mime, size, dims, `expires_at`). Size/count/MIME limited; expired unlinked assets cleaned up.
- **`studio_events`** — privacy-friendly analytics (`event_type` studio_view/project_view/link_click/request_start/request_submit, optional salted rotating `session_hash`, referrer host). No raw IP, no cross-site tracking.

Planned artist columns: `avatar_asset_key`, `cover_asset_key`, `featured_project_id`.

Planned R2 layout: `artists/{artistId}/avatar|cover/…`, `artists/{artistId}/portfolio/{projectId}/{assetId}`, `public-requests/{uploadToken}/{assetId}`.
