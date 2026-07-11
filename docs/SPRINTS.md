# Mirae Sprints

> Ticket queue and completion tracker. Update checkboxes as tickets complete. Source of truth for "next ticket".

## Current sprint

Sprint 9 — Polish and beta readiness

## Sprint 0 — Repository foundation ✅ complete

- [x] REPO-001 Initialize pnpm workspace and Turborepo
- [x] REPO-002 Create apps/web with Vite + React
- [x] REPO-003 Create apps/api with Hono, wrangler.toml, and /health
- [x] REPO-004 Create packages/db, shared, ui, config
- [x] REPO-005 Add TypeScript, ESLint, Prettier, Tailwind base
- [x] REPO-006 Add root scripts: dev, build, lint, typecheck, format
- [x] REPO-007 Add README and .env.example

Acceptance: `pnpm install` works · `pnpm dev` runs web (vite) + api (wrangler dev) together · `pnpm build`/`pnpm lint`/`pnpm typecheck` work · `GET /health` returns ok. **All met.**

Completion notes (2026-07-09):

- End-to-end verified: `pnpm dev` → web :5173 (200), api :8787/health (`{"status":"ok"}`), proxy `/api/*` :5173 → wrangler (200). Build, lint, typecheck, format all green.
- Deviations from plan, recorded in `docs/DECISIONS.md`: dropped `concurrently` (turbo orchestrates the two-process dev); `@cloudflare/vite-plugin` deferred.
- Extra pins resolved & recorded in `docs/VERSIONS.md`: @vitejs/plugin-react, @types/react(-dom), the ESLint/Prettier ecosystem, @tailwindcss/vite.
- Known issues / follow-ups: TanStack Router not yet wired (WEB-001); `@mirae/db` schema is a placeholder (DB-002); seed script pending (DB-004); apps don't consume the shared packages yet.
- **Next sprint:** Sprint 1 — Brand UI foundation (first ticket UI-001).

## Sprint 1 — Brand UI foundation ✅ complete

- [x] UI-001 Add design tokens and global CSS
- [x] UI-002 Add cn utility and component variant helpers
- [x] UI-003 Build Button, Input, Textarea, Badge, Card, Panel
- [x] UI-004 Build Radix-based Dialog, Dropdown, Tooltip, Tabs skins
- [x] UI-005 Build AppShell prototype
- [x] UI-006 Build Landing hero prototype
- [x] UI-007 Build dashboard preview mockup with seed data

Acceptance: landing close to Mirae direction · app shell has one clear sidebar · preview uses white/black/zinc + pastel blue · no beige/cream · no shadcn default look · components reusable. **All met.**

Completion notes (2026-07-10):

- End-to-end verified: `pnpm dev` → landing at :5173 (200, renders the hero + framed AppShell preview), api :8787/health ok, proxy `/api/*` ok. lint/typecheck/build/format all green.
- Direction locked (see `docs/DECISIONS.md` 2026-07-10): clean **light-only** SaaS at shadcn/Linear polish; shadcn-style base components on Mirae tokens; **Hugeicons** Stroke Rounded as the house icon family (lucide dropped); **Inter** self-hosted; premium motion (strong easing, scale-on-press, spring `HoverBarList`) per the user-global emil/apple design skills. Dark tokens kept dormant.
- New pins in `docs/VERSIONS.md`: motion, @hugeicons/react + core-free-icons, react-icons, @radix-ui/{react-slot,dialog,dropdown-menu,tooltip,tabs}.
- Built in `@mirae/ui`: Button, Input, Textarea, Badge (pastel tags), Card (+bezel), Panel, cn/cva helpers, HoverBarList, Icon wrapper, bespoke BranchReturn/EnterKey icons, Radix Dialog/Dropdown/Tooltip/Tabs skins. In `apps/web`: AppShell (collapsible sidebar + Overview/Queue views), Landing hero, seed data.
- Known issues / follow-ups: still **prototype** — no router yet (TanStack Router = WEB-001, Sprint 2); AppShell/Landing are mock, seed-driven (no backend); `@mirae/db` schema still placeholder (Sprint 3); design-system business components (CommissionCard etc.) live in apps/web, graduate to `@mirae/ui` when stable.
- **Next sprint:** Sprint 2 — Static product screens (first ticket WEB-001: set up TanStack Router file-based route tree).

## Sprint 2 — Static product screens ✅ complete

- [x] WEB-001 Set up TanStack Router file-based route tree
- [x] WEB-002 Create marketing routes
- [x] WEB-003 Create /app layout
- [x] WEB-004 Create overview screen with mock data
- [x] WEB-005 Create requests inbox with mock data
- [x] WEB-006 Create queue screen with mock data
- [x] WEB-007 Create commission detail panel with mock data
- [x] WEB-008 Create public artist page mock
- [x] WEB-009 Create request form mock

Acceptance: all routes load locally · UI matches direction · desktop-responsive · no backend. **All met.**

Completion notes (2026-07-10):

- End-to-end verified: `pnpm dev` → all 14 routes return 200 (marketing `/`, `/waitlist`, `/login`, `/signup`, `/onboarding`; app `/app` + overview/queue/requests/clients/deliveries/studio-page; public `/@handle` + `/@handle/request`), api `:8787/health` ok. lint/typecheck/build/format green.
- TanStack Router (file-based, code-split); `/app` is a layout with nested routes + URL-driven sidebar; `/app` → `/app/overview`. Router pins: @tanstack/react-router 1.170.17, router-plugin 1.168.19.
- Public artist routes use a `$handle` param (URL `@` is part of the value, stripped for display) — a literal `@`-prefixed segment made the plugin emit a non-param path.
- New in `@mirae/ui`: Sheet (right slide-over). New screens: single-page landing (hero + framed static DashboardPreview + pricing + CTA), auth/marketing pages, `/app` Overview + Queue (board/list/calendar tabs, commission detail Sheet) + Requests inbox, public artist page + request form. Seed data in `apps/web/src/components/mockups/seed.ts`.
- Known issues / follow-ups: Clients / Deliveries / Studio page are **ComingSoon placeholders** (built at their sprints — Studio Sprint 4, Clients Sprint 6, Deliveries Sprint 8); all screens mock/seed-driven (no backend/auth yet — Sprint 3); subdomain→/app host mapping deferred to deploy (Sprint 4). Backlog: ⌘K cmdk palette, onboarding flow + first-run tour.
- **Next sprint:** Sprint 3 — Database and auth foundation (first ticket DB-001: Neon project + dev branch, configure Drizzle).

## Sprint 3 — Database and auth foundation ✅ complete

- [x] DB-001 Create Neon project + dev branch, configure Drizzle
- [x] DB-002 Create MVP schema
- [x] DB-003 Generate migrations
- [x] DB-004 Add seed script
- [x] AUTH-001 Configure Better Auth inside the Hono app
- [x] AUTH-002 Add login/signup pages
- [x] AUTH-003 Add protected app routes
- [x] AUTH-004 Add onboarding artist profile creation

Acceptance: migrations run on the Neon dev branch · seed works · user can sign up/login · protected app routes work · artist profile created on onboarding. **All met.**

Completion notes (2026-07-11):

- End-to-end verified live: `pnpm db:check` (Neon Postgres 18, `neondb`) · `pnpm db:seed` (rows counted) · sign-up → session persisted → `get-session` · sign-in → `POST /api/artists` creates the profile → `GET /api/artists/me` 200 · unauthenticated `/me` → 401 · `/app` redirects to `/login` when logged out. lint/typecheck/build/format green.
- **DB**: 11 MVP tables + Better Auth tables (sessions/accounts/verifications), enums mirror `@mirae/shared`, money in integer cents. Migrations `0000`+`0001` committed under `packages/db/drizzle` and applied to Neon.
- **Auth**: Better Auth (email+password) built per-request in the Hono Worker with the Drizzle adapter (`usePlural`); `/api/auth/*`; web `auth-client`; login/signup/onboarding wired; `/app` protected via `beforeLoad`; sidebar sign-out.
- **New pins** (docs/VERSIONS.md): better-auth 1.6.23, @types/node 24.13.3, drizzle-orm in apps/api.
- Config: Worker secrets in `apps/api/.dev.vars` (gitignored: DATABASE_URL, BETTER_AUTH_SECRET/URL); tooling reads root `.env` via Node `loadEnvFile`.
- Known issues / follow-ups: the **seed user has no password** (created via direct insert) — log in via `/signup` or the demo `demo@mirae.test` / `commissions123`. App screens still show seed/mock data (not yet the logged-in user's real commissions — later sprints). Prod deploy (wrangler secrets, subdomain→/app) = Sprint 4/deploy. Onboarding doesn't yet redirect existing-profile users or gate `/app` on profile presence.
- **Next sprint:** Sprint 4 — Commission types and public page (first ticket CT-001: commission types API).

## Sprint 4 — Commission types and public page ✅ complete

- [x] CT-001 Add commission types API
- [x] CT-002 Add commission types UI
- [x] CT-003 Add artist profile editor basics
- [x] CT-004 Connect public @artist page to DB
- [x] CT-005 Add open/closed/waitlist state
- [x] CT-006 Add social bot user-agent detection + dynamic OG HTML for /@:handle

Acceptance: artist can define commission types + edit their profile/status · public `/@handle` page is DB-driven (no more seed) with 404 on unknown handles · public page reflects open/waitlist/closed · social crawlers get server-rendered OG meta. **All met.**

Completion notes (2026-07-11):

- End-to-end verified live on the Worker (:8787): commission-types CRUD + `PATCH /api/artists/me` persist · `GET /api/studio/@rainaoki` returns the real profile + 3 active types, `@demostudio` (waitlist, no types), unknown handle → 404 · Discordbot UA on `/@rainaoki` → server-rendered HTML with `og:title`/`og:description`, browser UA → SPA shell · SPA fallback serves index.html for `/login`, `/app/*`, `/@handle` while real assets still 200. lint/typecheck/build/format green.
- **API**: new public `GET /api/studio/:handle` (no auth, active types only, sorted); `PATCH /api/artists/me` (display name/tagline/bio/status). Bot branch in the Worker (`src/lib/og.ts`: `isSocialBot` + `renderStudioOg`) ahead of the SPA fallback.
- **Web**: Studio page profile editor (`ProfileEditor`) above the commission-types editor; public `ArtistPage` rewritten data-driven (TanStack Query, loading / not-found / empty states, price cents→€) with open/waitlist/closed CTA behavior.
- **Fix**: `run_worker_first` made the Worker 404 on client routes; added `serveSpa()` index.html fallback (needed for the Sprint-4 deploy; dev was masked by vite).
- Known issues / follow-ups: OG has no `og:image` yet (summary card, no large image) — add when brand/OG art exists. Subdomain→/app host mapping + wrangler secrets still deferred to deploy. Public page still can't actually submit a request (Sprint 5). Backlog: ⌘K palette, onboarding flow + first-run tour, Studio page live preview split.
- **Next sprint:** Sprint 5 — Request form and inbox (first ticket REQ-001: connect the public request form to the API).

## Sprint 5 — Request form and inbox ✅ complete

- [x] REQ-001 Connect public request form to API
- [x] REQ-002 Create commission request records
- [x] REQ-003 Build request inbox API
- [x] REQ-004 Connect request inbox UI
- [x] REQ-005 Build request detail panel
- [x] REQ-006 Add accept/decline actions

Acceptance: public request form submits real records · artist inbox lists their requests · detail panel shows the full request · accept/decline updates status. **All met.**

Completion notes (2026-07-11):

- End-to-end verified live (Worker :8787 / web :5173): public `POST /api/studio/:handle/requests` creates a `commission_requests` row (201), missing email → 400, unknown handle → 404, closed studio → 403 · authed `GET /api/requests` is owner-scoped (401 unauth) · `PATCH /api/requests/:id` sets accepted/declined (200), bad status → 400, unauth → 401 · inbox UI loads real data, detail slide-over shows the full brief, Accept/Decline flips the badge + filter counts. lint/typecheck/build/format green.
- **API**: `POST /api/studio/:handle/requests` (public, validates + folds deadline into message), `GET /api/requests` (auth, left-joins commission type name, newest-first), `PATCH /api/requests/:id` (auth, owner-scoped, status whitelist).
- **Web**: `RequestForm` rewritten data-driven (real studio + types, success/error/closed states); `RequestsView` reads the API with filter chips + live counts; new `RequestDetail` Sheet (full brief, email mailto, budget, deadline, timestamp) with wired Accept/Decline mutation → invalidate.
- Known issues / follow-ups: no email notification to the artist on a new request (Resend = Sprint 9 POLISH-009); accepted requests don't yet become commissions (COM-002, Sprint 6); budget stays free-text; no spam/rate-limit on the public endpoint yet. Backlog unchanged (⌘K palette, onboarding tour, Studio live preview).
- **Next sprint:** Sprint 6 — Queue and commissions (first ticket COM-001: commissions API).

## Sprint 6 — Queue and commissions ✅ complete

- [x] COM-001 Create commissions API
- [x] COM-002 Convert request to commission
- [x] COM-003 Build commission queue API
- [x] COM-004 Connect queue UI to backend
- [x] COM-005 Add status update action
- [x] COM-006 Connect commission detail panel
- [x] COM-007 Add basic activity log

Acceptance: commissions CRUD API · accepted request becomes a commission · queue board/list backed by real data · status changes from the detail panel · detail shows real commission + progress · activity log records key changes. **All met.**

Completion notes (2026-07-11):

- End-to-end verified live (Worker :8787 / web :5173): commissions CRUD (401 unauth, 201 create, 400 bad status, PATCH 200, DELETE 200, owner-scoped) · `POST /api/requests/:id/convert` creates a queued commission + marks the request accepted (409 if already handled) · `GET /api/commissions` returns queue rows joined to client name · `PATCH` status change + `GET /api/commissions/:id/activity` returns "created" + "status changed" entries newest-first (401 unauth). lint/typecheck/build/format green.
- **API**: `/api/commissions` CRUD (`routes/commissions.ts`), `POST /api/requests/:id/convert` (`routes/requests.ts`), `GET /api/commissions/:id/activity`. Statuses validated against the `commission_status` enum via `.enumValues`; money in cents; activity written on convert + status change.
- **Web**: shared `lib/commissions.ts` (status meta, lifecycle order, board columns, formatters); `QueueView`/`QueueListView` data-driven; `CommissionDetail` rewritten to real data with price/paid/deadline/client meta, a milestone progress timeline, a status action footer (Advance + change-status dropdown), and an activity feed; `queue.tsx` fetches via TanStack Query and selects by id so the panel tracks live updates.
- Known issues / follow-ups: no email/notification on status change (Resend → Sprint 9); commission price/paid/deadline not yet editable from the UI (only status); calendar view still a placeholder; `clients` table not populated (commission.clientId stays null, client info comes from the linked request); activity feed is create/status only. Backlog unchanged.
- **Next sprint:** Sprint 7 — Quotes and payment status (first ticket QUOTE-001: quote model/API).

## Sprint 7 — Quotes and payment status ✅ complete

- [x] QUOTE-001 Add quote model/API
- [x] QUOTE-002 Build quote builder UI
- [x] QUOTE-003 Add quote line items
- [x] QUOTE-004 Add send quote placeholder
- [x] QUOTE-005 Add manual payment status

Acceptance: itemized quote model/API · quote builder with line items · send-quote step · manual payment status on a commission. **All met.**

Completion notes (2026-07-11):

- End-to-end verified live (Worker :8787 / web :5173): `GET quote` null initially → `PUT` items → total €250 (150 + 2×50), commission price mirrored to €250 → `POST send` sets quote `sent` + commission `quote_sent` → `PATCH paidCents` 200; activity feed shows created / status / "Quote sent (250 €)" / "Payment recorded: 125 €". lint/typecheck/build/format green.
- **API** (on `routes/commissions.ts`): `GET/PUT /api/commissions/:id/quote` (one quote per commission, replace line items, recompute total, mirror onto price), `POST /api/commissions/:id/quote/send` (status→sent, sentAt, commission→quote_sent, activity), payment via existing `PATCH` (`paidCents`) now logs a payment activity entry.
- **Web**: `quotesApi` client; new `QuoteEditor` (itemized rows add/remove, live total, Save + Send, status pill) in the commission detail panel; a Payment section (Unpaid/Partial/Paid badge, paid/price, Deposit 50% / Mark paid / Clear).
- Known issues / follow-ups: quote isn't actually emailed (placeholder → Resend in Sprint 9); no client-facing quote acceptance yet (the client portal is Sprint 8, `accepted` status unused for now); payment is manual amounts (no Stripe — post-MVP); one quote per commission (no revisions/history). Backlog unchanged.
- **Next sprint:** Sprint 8 — Client portal and delivery (first ticket PORTAL-001: generate portal token).

## Sprint 8 — Client portal and delivery ✅ complete

- [x] PORTAL-001 Generate portal token
- [x] PORTAL-002 Build /portal/:token
- [x] PORTAL-003 Add status timeline
- [x] PORTAL-004 Add client feedback placeholder
- [x] DELIV-001 Add delivery model
- [x] DELIV-002 Build /delivery/:token
- [x] DELIV-003 Wire file uploads/downloads to Cloudflare R2
- [x] DELIV-004 Add mark delivered action

Acceptance: portal token per commission · public `/portal/:token` with status timeline + feedback · delivery model + public `/delivery/:token` · R2 file uploads/downloads · mark-delivered. **All met.**

Completion notes (2026-07-11):

- End-to-end verified live (Worker :8787 / web :5173): generate portal token → public `GET /api/portal/:token` returns title + artist + quote · prepare delivery → token · multipart upload streams to R2 (local sim) → public `GET /api/delivery/:token` lists the file → public download streams the file bytes (200) · mark delivered → `deliveredAt` stamped, commission status → `delivered`. lint/typecheck/build/format green.
- **API**: `POST /api/commissions/:id/portal` (idempotent token); public `GET /api/portal/:token` (`routes/portal.ts`); `GET/POST /api/commissions/:id/delivery` (+ `/deliver`); files `GET/POST(multipart→R2)/DELETE` on `/api/commissions/:id/files`; public `GET /api/delivery/:token` + `/files/:fileId` streaming download (`routes/delivery.ts`). R2 bucket binding `FILES` in `wrangler.toml`.
- **Web**: public routes `/portal/:token` (PortalPage: status/price/paid/quote + shared milestone timeline + local feedback placeholder) and `/delivery/:token` (DeliveryPage: message + downloadable files). Commission detail gains Client-portal (generate/copy link), Delivery (prepare link, upload/list/remove files, mark delivered) sections; shared `milestones()` helper in `lib/commissions.ts`.
- Known issues / follow-ups: **production R2 bucket must be provisioned** (`wrangler r2 bucket create mirae-files`) — dev uses the local simulated bucket; portal feedback + email notifications not persisted/sent (Resend → Sprint 9); no upload size/type limits or virus scan; single delivery per commission. Backlog unchanged.
- **Next sprint:** Sprint 9 — Polish and beta readiness (first ticket POLISH-001: empty states).

## Sprint 9 — Polish and beta readiness

- [x] POLISH-001 Add empty states
- [x] POLISH-002 Add loading states
- [x] POLISH-003 Add error states
- [x] POLISH-004 Add toast feedback
- [ ] POLISH-005 Improve keyboard/focus states
- [ ] POLISH-006 Responsive pass
- [ ] POLISH-007 Demo seed data
- [ ] POLISH-008 Landing waitlist CTA
- [ ] POLISH-009 Wire Resend for real notification emails

## Backlog — future UX (not scheduled)

- **Onboarding flow + first-run tour**: make the entry journey smooth and continuous — sign up → login → arriving in the app (not isolated pages) — and add a dismissible first-run **guided tour** on the dashboard for new artists. Design before building; revisit when auth (Sprint 3) + app screens are further along.
- **Command palette (⌘K)**: wire the sidebar Search (and ⌘K) to a `cmdk`-based command palette — quick nav + actions across the app. Add `cmdk` (pin version) when built.
- **Studio page live preview**: split the Studio page — editor on the left, a **live preview of the public `/@handle` page** on the right (updates as you edit profile + commission types).

## Notes

- Init (2026-07-09): docs created, master rewritten into index. Dev runtime = two-process concurrently (see DECISIONS). Versions pinned per DECISIONS.
