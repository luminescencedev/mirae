# Architecture

> Canonical source for repo structure, deployment model, and module rules. See `docs/DECISIONS.md` for the _why_ behind the locked choices.

## Deployment model — single Cloudflare Worker

One Worker serves **both** the built Vite SPA (static assets) and the Hono API. There is no separate frontend/backend hosting: one `wrangler.toml`, one `wrangler deploy`.

- Hono is the Worker's `main` entrypoint (`apps/api/src/index.ts`).
- `/api/*` → handled directly by Hono routes.
- `/@:handle` (and other public pages) → bot user-agent detection; social bots (Discordbot, Twitterbot, …) get dynamically generated Open Graph HTML pulled from the DB; regular visitors fall through to the SPA.
- Everything else → Cloudflare Static Assets binding serving the Vite build (`apps/web/dist`).

Why one Worker and not two: the `/@:handle` OG logic needs the HTTP request, the database, and the static-asset fallback in the same place. Splitting would duplicate DB access or add an internal hop for no benefit. This is a **locked decision** — do not reintroduce Express, React Router, Vercel-specific code, or a second deployable Worker without explicit approval.

## Monorepo layout

```txt
mirae/
├─ apps/
│  ├─ web/              # Vite + React + TanStack Router — landing, dashboard, public pages (builds to dist/)
│  └─ api/              # Hono app — THIS is the deployed Cloudflare Worker
│     ├─ wrangler.toml  # main = src/index.ts, assets.directory = ../web/dist
│     └─ src/
├─ packages/
│  ├─ db/               # Drizzle schema, migrations, seed — Neon serverless driver
│  ├─ shared/           # shared types, zod schemas, constants
│  ├─ ui/               # Mirae design system primitives/components
│  └─ config/           # eslint, tsconfig, prettier, tailwind preset
├─ docs/
├─ .github/
├─ package.json
├─ pnpm-workspace.yaml
├─ turbo.json
├─ .env.example
└─ README.md
```

## Web (`apps/web`)

TanStack Router file-based routes (NOT React Router).

```txt
src/
├─ routes/
│  ├─ __root.tsx
│  ├─ index.tsx            # marketing home
│  ├─ pricing.tsx  waitlist.tsx  login.tsx  signup.tsx  onboarding.tsx
│  ├─ app/
│  │  ├─ route.tsx         # /app layout (protected)
│  │  ├─ overview.tsx  queue.tsx  requests.tsx  clients.tsx
│  │  ├─ deliveries.tsx  studio-page.tsx  settings.tsx
│  └─ $handle/
│     ├─ index.tsx         # public artist page /@:handle
│     └─ request.tsx       # /@:handle/request
├─ features/              # commissions, requests, clients, quotes, files, studio, settings
├─ components/            # marketing, app-shell, mockups
├─ lib/                   # api-client.ts, auth-client.ts, cn.ts, format.ts
├─ styles/globals.css
├─ router.tsx
└─ main.tsx
```

### Route map

```txt
/  /pricing  /waitlist  /login  /signup  /onboarding
/app  /app/overview  /app/queue  /app/requests  /app/clients
/app/deliveries  /app/studio-page  /app/settings
/@:handle  /@:handle/request  /portal/:token  /delivery/:token
```

**Domains vs paths.** Production: marketing on `usemirae.com`, the private dashboard on `app.usemirae.com`. The router uses the `/app/*` path prefix (dev: `localhost:5173/app/...`); the single Worker maps the `app.` host to the `/app` subtree at deploy time (Sprint 4). So `/app/*` is the internal path — the dashboard is reached at `app.usemirae.com` in production.

## API (`apps/api`, the Worker)

```txt
src/
├─ index.ts                 # Hono entrypoint — the Worker `main`
├─ env.ts
├─ routes/                  # auth, artists, commission-types, requests, commissions,
│                           #   clients, quotes, deliveries, webhooks (Stripe), public-page (OG)
├─ modules/<module>/        # artists, commission-types, requests, commissions, clients,
│                           #   quotes, deliveries, files (R2), emails (Resend)
├─ middleware/              # auth, error-handler, rate-limit, validate (zod)
├─ lib/                     # db (Drizzle+Neon), logger, response, slug
└─ types/
```

### Module rules (per `modules/<module>/`)

```txt
<module>.controller.ts  -> Hono route handler only (request/response)
<module>.service.ts     -> business logic
<module>.repository.ts  -> DB queries via Drizzle
<module>.validators.ts  -> Zod schemas (used with @hono/zod-validator)
<module>.types.ts       -> local module types
```

### MVP endpoints

```txt
GET  /health
POST /auth/*                              GET  /me
GET  /artists/me                          PATCH /artists/me
GET  /studio/:handle                      GET  /studio/:handle/commission-types
POST /studio/:handle/requests
GET  /commission-types  POST /commission-types  PATCH /commission-types/:id  DELETE /commission-types/:id
GET  /requests  GET /requests/:id  PATCH /requests/:id  POST /requests/:id/accept  POST /requests/:id/decline
GET  /commissions  POST /commissions  GET /commissions/:id  PATCH /commissions/:id  PATCH /commissions/:id/status
GET  /clients  GET /clients/:id  PATCH /clients/:id
POST /quotes  GET /quotes/:id  PATCH /quotes/:id  POST /quotes/:id/send
GET  /portal/:token  POST /portal/:token/feedback
POST /deliveries  GET /deliveries/:token
POST /webhooks/stripe
```

## Packages

- **`packages/db`** — Drizzle schema (one file per table under `src/schema/`), `client.ts` (Neon serverless + Drizzle), `seed/seed-dev.ts`, `drizzle.config.ts`. Local dev DB = a dedicated Neon branch, **not** local Docker Postgres — prod must use the Neon HTTP driver (Workers cannot open raw TCP), so develop against real Neon to avoid driver mismatch.
- **`packages/shared`** — `constants/` (commission-status, pricing, routes), `schemas/` (zod), `types/` (api, common).
- **`packages/ui`** — Mirae design system: `primitives/`, `layout/`, `feedback/`, `utils/`. Radix behavior + custom Mirae visuals. Business components may start in `apps/web/src/features/*/components` and graduate to `packages/ui/src/mirae` once stable.
- **`packages/config`** — shared eslint, tsconfig, prettier, tailwind preset.

## Local dev

Two-process setup (see `docs/DECISIONS.md` — `@cloudflare/vite-plugin` was considered and deferred):

```txt
web:  vite dev      -> http://localhost:5173   (strictPort; proxies /api/* to wrangler)
api:  wrangler dev  -> http://localhost:8787    (health: /health)
```

Run together from root with `pnpm dev` (= `turbo run dev`, both persistent tasks in parallel). See `docs/CONTRIBUTING.md`.

## Planned post-MVP modules (NOT yet implemented)

> Planned for the next cycle (Sprints 11+). These do **not** exist in the code yet — document the code that exists, not these, until they ship. The current API keeps its existing shape (Hono route modules under `apps/api/src/routes/*`, owner-scoping via `getArtist`); do **not** rewrite it into a fictional controller/service/repository layering. New modules should follow the same existing pattern. Endpoint lists: [`DATA_AND_API_EXTENSION.md`](DATA_AND_API_EXTENSION.md).

Planned route modules (same single Worker, same Neon/R2/Better-Auth stack):

- **portfolio** — `/api/portfolio/projects*` + `/assets*` CRUD, reorder, controlled R2 upload, MIME/size validation, orphan cleanup.
- **artist media** — `/api/artists/me/avatar|cover` upload/delete.
- **artist links** — `/api/artist-links*` CRUD + reorder, URL validation/normalization.
- **appearance** — `/api/studio-appearance` draft/publish/reset (server-validated presets).
- **request references** — `/api/studio/:handle/request-upload-session*` (short-lived token, private uploads).
- **analytics** — `/api/studio/:handle/events` (ingest) + `/api/analytics/studio` (aggregate).
- **public studio** — the public `@handle` response grows into a single composed payload (profile + appearance + links + featured project + projects + commission types + availability), returning published/enabled content only.

Every new upload endpoint must enforce: authenticated ownership (private) or scoped token (public), MIME + size limits, and storage cleanup on delete. Mobile behavior is a design input for these modules from the start (see [`MOBILE_PRODUCT_SPEC.md`](MOBILE_PRODUCT_SPEC.md)), not a later patch.
