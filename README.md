# Mirae

**Your private commission studio.**

> Mirae helps digital artists manage requests, quotes, queues, revisions and deliveries in one calm workspace.

Mirae is a private workspace for digital artists who **already have their own clients** and want a clean place to manage the work once a client relationship exists — receiving structured requests, quoting, tracking the queue, handling revisions, and delivering final files. Think **Calendly, not VGen**: it takes over after both sides agreed to work together; it never finds clients. Not a marketplace, discovery platform, or escrow. Subscription-only — Mirae never takes a cut of commission revenue.

## Stack

- **Monorepo:** pnpm workspaces + Turborepo
- **Web:** Vite + React + TanStack Router + Tailwind CSS v4 (`apps/web`)
- **API:** Hono, deployed as a single Cloudflare Worker that also serves the built web app (`apps/api`)
- **Database:** PostgreSQL on Neon (serverless HTTP driver) + Drizzle ORM (`packages/db`)
- **Auth:** Better Auth · **Email:** Resend · **Files:** Cloudflare R2 · **Billing:** Stripe (subscription; Connect post-MVP)

Full rationale in [`docs/DECISIONS.md`](docs/DECISIONS.md).

## Repository layout

```txt
apps/
  web/        Vite + React app (landing, dashboard, public pages) — builds to dist/
  api/        Hono app — THIS is the deployed Cloudflare Worker
packages/
  db/         Drizzle schema, migrations, seed (Neon)
  shared/     Shared types, zod schemas, constants
  ui/         Mirae design system (Radix behavior + custom visuals)
  config/     Shared tsconfig, ESLint, Prettier
docs/         Source of truth (see below)
```

## Prerequisites

- **Node.js** 24.x (Active LTS)
- **pnpm** 11.10.0

## Getting started

```bash
pnpm install
pnpm dev
```

`pnpm dev` runs both processes in parallel (via `turbo run dev`):

| Process        | URL                   | Notes                                |
| -------------- | --------------------- | ------------------------------------ |
| web (vite)     | http://localhost:5173 | proxies `/api/*` to the Worker       |
| api (wrangler) | http://localhost:8787 | health: http://localhost:8787/health |

Copy `.env.example` → `.env` and fill values as sprints require them (the DB is wired in Sprint 3; the app runs without it before then).

## Scripts

| Command            | Does                                            |
| ------------------ | ----------------------------------------------- |
| `pnpm dev`         | Run web + api locally                           |
| `pnpm build`       | Build all workspaces                            |
| `pnpm typecheck`   | Type-check all workspaces                       |
| `pnpm lint`        | ESLint across the repo                          |
| `pnpm format`      | Format with Prettier (`format:check` to verify) |
| `pnpm db:generate` | Generate Drizzle migrations                     |
| `pnpm db:migrate`  | Apply migrations to the Neon branch             |
| `pnpm db:studio`   | Open Drizzle Studio                             |

## Deployment

One Worker, one deploy. Hono handles `/api/*` and the `/@:handle` OG bot-detection; everything else falls through to the static assets binding serving `apps/web/dist`.

```bash
pnpm --filter @mirae/web build   # produce dist/
pnpm --filter @mirae/api deploy  # wrangler deploy
```

## Documentation (source of truth)

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — structure, single-Worker deployment, module rules, endpoints
- [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md) — visual direction, palette, components
- [`docs/SPRINTS.md`](docs/SPRINTS.md) — sprint roadmap + ticket queue
- [`docs/DATABASE.md`](docs/DATABASE.md) — schema, Neon + Drizzle conventions
- [`docs/DECISIONS.md`](docs/DECISIONS.md) — stack, single-Worker reasoning, business model
- [`docs/VERSIONS.md`](docs/VERSIONS.md) — pinned dependency versions
- [`docs/CONTRIBUTING.md`](docs/CONTRIBUTING.md) — local dev, checks, commit/PR rules

## Status

Early development — Sprint 0 (repository foundation) complete; Sprint 1 (brand UI foundation) next. See [`docs/SPRINTS.md`](docs/SPRINTS.md) for progress.
