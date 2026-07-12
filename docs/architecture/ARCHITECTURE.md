# Architecture

> Canonical source for repo structure, deployment model, and module rules. See `docs/decisions/DECISIONS.md` for the _why_ behind the locked choices.

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
├─ routes/                 # TanStack file-based (routeTree.gen.ts is generated)
│  ├─ __root.tsx
│  ├─ index.tsx            # marketing landing (hero + pricing section + CTA)
│  ├─ waitlist.tsx  login.tsx  signup.tsx  onboarding.tsx
│  ├─ app.tsx              # /app layout (protected; gated on a studio profile)
│  ├─ app/                 # overview, queue, requests, clients, deliveries, studio-page, index
│  ├─ $handle/             # index.tsx (public /@:handle) · request.tsx
│  └─ portal/$token.tsx    delivery/$token.tsx
├─ components/             # app-shell, marketing, public, mockups
├─ lib/                    # api.ts, auth-client.ts, query.ts, commissions.ts
├─ styles/globals.css
└─ main.tsx
```

### Route map

```txt
/  /waitlist  /login  /signup  /onboarding
/app  /app/overview  /app/queue  /app/requests  /app/clients  /app/deliveries  /app/studio-page
/@:handle  /@:handle/request  /portal/:token  /delivery/:token
```

**Domains vs paths.** Production: marketing + public pages on `usemirae.com`, the private dashboard on `app.usemirae.com` (both are custom domains on the one Worker). The router uses the `/app/*` path prefix (dev: `localhost:5173/app/...`); in production the Worker's `hostSplitRedirect` (in `index.ts`) sends `/app|/login|/signup|/onboarding` to `app.usemirae.com` and everything else to the apex, no-op on localhost. This host-split is **implemented** (shipped at deploy).

## API (`apps/api`, the Worker)

```txt
src/
├─ index.ts                 # Hono entrypoint (Worker `main`): mounts routes,
│                           #   /api/waitlist, /@:handle OG + host-split, SPA fallback
├─ auth.ts                  # makeAuth(env) — Better Auth built per request
├─ routes/                  # one flat Hono module per area (see below)
│  ├─ artists.ts   commission-types.ts   studio.ts   requests.ts
│  └─ commissions.ts   portal.ts   delivery.ts
└─ lib/                     # session.ts (getArtist/getUserId), og.ts, mail.ts (Resend), log.ts (structured JSON)
```

Route files are **flat Hono modules** — a module owns its handlers + Drizzle queries directly (owner-scoping via `getArtist`). There is intentionally no controller/service/repository layering and no `middleware/` or `env.ts`; env is the request-scoped `Bindings` type. Keep new modules in this same shape.

### Endpoints (implemented)

```txt
GET  /health   GET /api/health
ALL  /api/auth/*                          (Better Auth: sign-up, sign-in, session…)
POST /api/waitlist
POST /api/client-errors                   (SPA crash reports → structured log)
GET  /api/artists/me   PATCH /api/artists/me   POST /api/artists
GET  /api/commission-types   POST …   PATCH /:id   DELETE /:id
GET  /api/studio/:handle                  POST /api/studio/:handle/requests
GET  /api/requests   PATCH /api/requests/:id   POST /api/requests/:id/convert
GET  /api/commissions   POST …   PATCH /:id   DELETE /:id
GET  /api/commissions/:id/activity
GET|POST /api/commissions/:id/delivery    POST /api/commissions/:id/delivery/deliver
GET  /api/commissions/:id/files   POST … (multipart→R2)   DELETE /:id/files/:fileId
GET|PUT /api/commissions/:id/quote        POST /api/commissions/:id/quote/send
POST /api/commissions/:id/portal          (generate portal token)
GET  /api/portal/:token                   POST /api/portal/:token/feedback
GET  /api/delivery/:token                 GET /api/delivery/:token/files/:fileId
GET  /:handle                             (bot → OG HTML; human → SPA)
```

Unhandled throws are caught by a central `app.onError` that emits a structured single-line JSON log (via `lib/log.ts`, captured in Cloudflare Workers logs / `wrangler tail`) and returns a generic `500 { error }`; expected `HTTPException`s keep their intended response. Client render crashes are reported by the SPA to `POST /api/client-errors` and logged the same way.

Payment status is manual (`PATCH /api/commissions/:id` sets `paidCents`); there is **no** Stripe webhook — billing is planned post-MVP (Sprint 25). Planned modules (portfolio, links, appearance, analytics, request uploads) are in the post-MVP section below.

## Packages

- **`packages/db`** — Drizzle schema (one file per table under `src/schema/`), `client.ts` (Neon serverless + Drizzle), `seed/seed-dev.ts`, `drizzle.config.ts`. Local dev DB = a dedicated Neon branch, **not** local Docker Postgres — prod must use the Neon HTTP driver (Workers cannot open raw TCP), so develop against real Neon to avoid driver mismatch.
- **`packages/shared`** — `constants/` (commission-status, pricing, routes), `schemas/` (zod), `types/` (api, common).
- **`packages/ui`** — Mirae design system: `primitives/`, `layout/`, `feedback/`, `utils/`. Radix behavior + custom Mirae visuals. Business components may start in `apps/web/src/features/*/components` and graduate to `packages/ui/src/mirae` once stable.
- **`packages/config`** — shared eslint, tsconfig, prettier, tailwind preset.

## Local dev

Two-process setup (see `docs/decisions/DECISIONS.md` — `@cloudflare/vite-plugin` was considered and deferred):

```txt
web:  vite dev      -> http://localhost:5173   (strictPort; proxies /api/* to wrangler)
api:  wrangler dev  -> http://localhost:8787    (health: /health)
```

Run together from root with `pnpm dev` (= `turbo run dev`, both persistent tasks in parallel). See `docs/architecture/CONTRIBUTING.md`.

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

Every new upload endpoint must enforce: authenticated ownership (private) or scoped token (public), MIME + size limits, and storage cleanup on delete. Mobile behavior is a design input for these modules from the start (see [`MOBILE_PRODUCT_SPEC.md`](../product/MOBILE_PRODUCT_SPEC.md)), not a later patch.
