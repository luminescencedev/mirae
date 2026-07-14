# Mirae Sprints

> Ticket queue and completion tracker. Update checkboxes as tickets complete. Source of truth for "next ticket".

## Current sprint

Sprints 11 (identity), 12 (portfolio backend), 13 (portfolio manager UI) and 14 (artist links: data + API + manager) ✅ shipped. `@mirae/ui` expanded with Select/Switch/Avatar/Skeleton/Progress/Separator/Accordion/AlertDialog. **Next sprint: Sprint 15 — Creative public studio (the flagship `/@handle` redesign)**, which also lands the deferred link render pieces (cards/icons/mobile preview) + the Fiverr-like request drawer. Component adoption across existing screens folded into Sprint 24 (OPS-014). Full detail in docs/roadmap/POST_MVP_ROADMAP.md.

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
- Deviations from plan, recorded in `docs/decisions/DECISIONS.md`: dropped `concurrently` (turbo orchestrates the two-process dev); `@cloudflare/vite-plugin` deferred.
- Extra pins resolved & recorded in `docs/architecture/VERSIONS.md`: @vitejs/plugin-react, @types/react(-dom), the ESLint/Prettier ecosystem, @tailwindcss/vite.
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
- Direction locked (see `docs/decisions/DECISIONS.md` 2026-07-10): clean **light-only** SaaS at shadcn/Linear polish; shadcn-style base components on Mirae tokens; **Hugeicons** Stroke Rounded as the house icon family (lucide dropped); **Inter** self-hosted; premium motion (strong easing, scale-on-press, spring `HoverBarList`) per the user-global emil/apple design skills. Dark tokens kept dormant.
- New pins in `docs/architecture/VERSIONS.md`: motion, @hugeicons/react + core-free-icons, react-icons, @radix-ui/{react-slot,dialog,dropdown-menu,tooltip,tabs}.
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
- **New pins** (docs/architecture/VERSIONS.md): better-auth 1.6.23, @types/node 24.13.3, drizzle-orm in apps/api.
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

## Sprint 9 — Polish and beta readiness ✅ complete

- [x] POLISH-001 Add empty states
- [x] POLISH-002 Add loading states
- [x] POLISH-003 Add error states
- [x] POLISH-004 Add toast feedback
- [x] POLISH-005 Improve keyboard/focus states
- [x] POLISH-006 Responsive pass
- [x] POLISH-007 Demo seed data
- [x] POLISH-008 Landing waitlist CTA
- [x] POLISH-009 Wire Resend for real notification emails

Acceptance: consistent empty/loading/error states · toast feedback · keyboard/focus · responsive · demo seed · working waitlist CTA · real notification emails. **All met.**

Completion notes (2026-07-11):

- **UI states**: new `@mirae/ui` primitives — Spinner, LoadingState, EmptyState, ErrorState (retry), and a ToastProvider/useToast (motion, auto-dismiss). Wired states into the requests inbox + queue; success/error toasts into accept/decline, quote save/send, status + payment, file upload, mark-delivered.
- **A11y**: skip-to-content link + `#main-content` landmark in the app shell; focus-visible rings across controls.
- **Responsive**: sidebar starts collapsed on small screens; lists/board/detail/public pages stack via responsive utilities.
- **Seed**: richer demo lifecycle (added a delivered commission + delivery + file).
- **Waitlist**: new `waitlist` table (migration 0002), public `POST /api/waitlist` (dedup), wired the `/waitlist` form.
- **Emails**: `lib/mail.ts` — Resend over the HTTP API (no SDK dep), best-effort no-op when `RESEND_API_KEY` is unset. Notifications: new request → artist; quote sent → client (portal link); delivered → client (delivery link). lint/typecheck/build/format green.
- Known issues / follow-ups: set `RESEND_API_KEY` (+ optional `MAIL_FROM`, a verified domain sender) as a Worker secret to actually send — until then emails are logged and skipped; portal client feedback still local-only (not persisted); Stripe billing is post-MVP.
- **MVP complete** — deployed to Cloudflare (usemirae.com + app.usemirae.com). Remaining backlog is future UX (⌘K palette, onboarding tour, Studio live preview).

## Sprint 10 — Audit & polish ✅ complete

Post-MVP hardening. Goal: every button does something, every screen shows the signed-in artist's real data, no mock left in the app.

Completion notes (2026-07-11): `/app` redirects to onboarding without a studio; Overview / Clients / Deliveries read the signed-in artist's real data (Rain Aoki mock gone); sidebar search is a real ⌘K command palette + the bell a real notifications menu (live requests badge); the queue Calendar tab is a real deadline calendar; portal feedback is persisted (migration 0003) and shows in the artist activity feed; marketing DashboardPreview matches the current UI. Verified: portal feedback POST 201/400/404 live; lint/typecheck/build/format green.

- [x] AUDIT-001 Gate /app on an artist profile (redirect to /onboarding if none)
- [x] AUDIT-002 Wire the Overview screen to real data (stats + recent activity from commissions/requests)
- [x] AUDIT-003 Real Clients page (derive from requests/commissions; replace ComingSoon)
- [x] AUDIT-004 Real Deliveries page (list commissions with a delivery; replace ComingSoon)
- [x] AUDIT-005 Remove or wire dead controls (sidebar search, notification bell)
- [x] AUDIT-006 Refresh the marketing DashboardPreview to match the real UI
- [x] AUDIT-007 Queue calendar view (real deadlines) or drop the tab
- [x] AUDIT-008 Persist client feedback from the portal

Acceptance: signing up → a fresh studio shows _your_ data (not Rain Aoki); no button is a no-op; Clients/Deliveries are real; landing preview matches the app.

## Backlog — future UX (not scheduled)

- **Onboarding flow + first-run tour**: make the entry journey smooth and continuous — sign up → login → arriving in the app (not isolated pages) — and add a dismissible first-run **guided tour** on the dashboard for new artists. Design before building; revisit when auth (Sprint 3) + app screens are further along.
- **Command palette (⌘K)**: wire the sidebar Search (and ⌘K) to a `cmdk`-based command palette — quick nav + actions across the app. Add `cmdk` (pin version) when built.
- **Studio page live preview**: split the Studio page — editor on the left, a **live preview of the public `/@handle` page** on the right (updates as you edit profile + commission types).

## Notes

- Init (2026-07-09): docs created, master rewritten into index. Dev runtime = two-process concurrently (see DECISIONS). Versions pinned per DECISIONS.

## Post-MVP sprints (planned)

Same ticket-queue format as above. Full goals, acceptance criteria and field/spec detail for each ticket live in [`POST_MVP_ROADMAP.md`](POST_MVP_ROADMAP.md); this is the checklist.

## Sprint 10.5 — Repository & production baseline ✅ complete

_Complete._ Goal: make the repo, docs and production setup accurately represent the current product. All twelve META tickets shipped: docs reconciled with the deployed product, screenshots added, a client-side error boundary + structured server/client error logging, and pre-release + smoke-test checklists ([`docs/architecture/RELEASE.md`](../architecture/RELEASE.md)).

- [x] META-001 Change the GitHub default branch to `main`
- [x] META-002 Update README status from Sprint 0 to deployed MVP
- [x] META-003 Add production URLs
- [x] META-004 Add current product screenshots
- [x] META-005 Clarify Stripe as post-MVP subscription work
- [x] META-006 Remove or archive merged branches
- [x] META-007 Audit outdated architecture documentation
- [x] META-008 Document all production environment variables
- [x] META-009 Add client-side error boundary
- [x] META-010 Add structured production error logging
- [x] META-011 Create pre-release checklist
- [x] META-012 Create production smoke-test checklist

Next sprint: **Sprint 11 — Mirae identity foundation** (BRAND-001).

## Sprint 11 — Mirae identity foundation ✅ complete

_Complete._ Goal: a distinctive visual identity before redesigning public surfaces. The mark (rounded zigzag M) is locked; wordmark is provisional Inter (BRAND-003). Full system — vectors, `@mirae/ui` `<Mark/>`/`<Logo/>`/`<Loader/>`, favicon/app-icon/OG/email/avatar rasters — in [`../product/BRAND.md`](../product/BRAND.md), `packages/ui/src/brand/`, `apps/web/public/`. Rasters regenerate from vectors via `scripts/generate-brand-assets.mjs`.

- [x] BRAND-001 Lock brand attributes and personality
- [x] BRAND-002 Design the Mirae geometric symbol
- [x] BRAND-003 Design the Mirae wordmark
- [x] BRAND-004 Create responsive logo lockups
- [x] BRAND-005 Create monochrome variants
- [x] BRAND-006 Create favicon set
- [x] BRAND-007 Create application icon
- [x] BRAND-008 Create social avatar
- [x] BRAND-009 Define brand motion principles
- [x] BRAND-010 Create loading mark animation
- [x] BRAND-011 Create Open Graph composition system
- [x] BRAND-012 Create email branding assets
- [x] BRAND-013 Document logo and identity usage

## Sprint 12 — Portfolio data & media infrastructure

Goal: backend foundation for real artist work, profile imagery and public media. **Backend shipped** (`/api/portfolio/*`, avatar/cover upload, public payload). Deferred: PORTFOLIO-012 (image dimensions/blur — needs client-side extraction or an image lib in the Worker; columns exist) and PORTFOLIO-016 seed (seed wipes the shared DB; demo projects added via the Sprint 13 UI instead). Portfolio manager UI = Sprint 13.

- [x] PORTFOLIO-001 Add avatar and cover media fields
- [x] PORTFOLIO-002 Create `portfolio_projects` table
- [x] PORTFOLIO-003 Create `portfolio_assets` table
- [x] PORTFOLIO-004 Add project ordering
- [x] PORTFOLIO-005 Add asset ordering
- [x] PORTFOLIO-006 Add draft and published states
- [x] PORTFOLIO-007 Add featured project state
- [x] PORTFOLIO-008 Add portfolio CRUD API
- [x] PORTFOLIO-009 Add project asset upload API
- [x] PORTFOLIO-010 Add direct or controlled R2 upload flow
- [x] PORTFOLIO-011 Add MIME and size validation
- [ ] PORTFOLIO-012 Add image dimension metadata (deferred → media-pipeline; = DEBT-017)
- [x] PORTFOLIO-013 Add asset deletion
- [x] PORTFOLIO-014 Add orphan asset cleanup
- [x] PORTFOLIO-015 Extend public studio response
- [x] PORTFOLIO-016 Add migration and demo seed (done in Sprint 17.5 / DEBT-018)

## Sprint 13 — Portfolio manager

Goal: a visual, fast, touch-friendly portfolio management experience. **Core shipped** (Portfolio section in Studio: create, edit title/description/type, draft/publish/archived, featured, up/down reorder, multi-upload dropzone + Progress, Skeleton loading, AlertDialog delete). Also expanded `@mirae/ui` (Select, Switch, Avatar, Skeleton, Progress, Separator, Accordion, AlertDialog). Deferred to the polish/mobile pass (Sprint 18): PORTUI-005 true drag-and-drop, 007 asset ordering, 008 cover selection, 010 alt-text, 014 explicit upload retry.

- [x] PORTUI-001 Add Portfolio section to Studio
- [x] PORTUI-002 Build upload dropzone
- [x] PORTUI-003 Build multi-image project creation
- [x] PORTUI-004 Build project editor
- [x] PORTUI-005 Add drag-and-drop project ordering (Sprint 17.5 / DEBT-004)
- [x] PORTUI-006 Add touch-friendly reordering
- [x] PORTUI-007 Add asset ordering (Sprint 17.5 / DEBT-005)
- [x] PORTUI-008 Add project cover selection (Sprint 17.5 / DEBT-001)
- [x] PORTUI-009 Add title and description fields
- [x] PORTUI-010 Add alt-text editing (Sprint 17.5 / DEBT-002)
- [x] PORTUI-011 Add draft and publish controls
- [x] PORTUI-012 Add featured project control
- [x] PORTUI-013 Add upload progress
- [x] PORTUI-014 Add retry and failure states (Sprint 17.5 / DEBT-003)
- [x] PORTUI-015 Add destructive confirmation
- [x] PORTUI-016 Add polished empty states
- [x] PORTUI-017 Add mobile upload from gallery or camera

## Sprint 14 — Artist links & public hub

Goal: an artist-specific link-in-bio hub that stays portfolio-first. **Data + API + manager shipped** (artist_links, `/api/artist-links` CRUD/reorder/URL-normalize/click counter, LinkManager in Studio, links in the public payload). The public-facing render pieces belong to the Sprint 15 public-studio redesign and are deferred there: LINKS-012 platform brand icons, 013 simple / 014 featured / 015 media link cards, 017 mobile preview. LINKS-010 true drag-and-drop (up/down works) → Sprint 18 polish.

- [x] LINKS-001 Create `artist_links` table
- [x] LINKS-002 Add links CRUD API
- [x] LINKS-003 Add predefined platform types
- [x] LINKS-004 Add custom links
- [x] LINKS-005 Add link ordering
- [x] LINKS-006 Add enabled and disabled state
- [x] LINKS-007 Add featured state
- [x] LINKS-008 Add display style field
- [x] LINKS-009 Build link manager
- [x] LINKS-010 Add drag-and-drop ordering (Sprint 17.5 / DEBT-006)
- [x] LINKS-011 Add URL validation and normalization
- [x] LINKS-012 Add platform icon mapping (Sprint 17.5 / DEBT-008)
- [x] LINKS-013 Add simple link card (Sprint 17.5 / DEBT-009)
- [x] LINKS-014 Add featured link card (Sprint 17.5 / DEBT-009)
- [x] LINKS-015 Add media link card (Sprint 17.5 / DEBT-009 — falls back to card until link images land)
- [x] LINKS-016 Add click analytics
- [x] LINKS-017 Add mobile preview (Sprint 18 / MOBILE-022)

## Sprint 15 — Creative public studio

Goal: replace the functional profile card with a portfolio-first artist homepage. **Core shipped** (STUDIO-001…006, 008, 009, 011, 016, 018, 021): the `/@handle` page reworked in the reference-portfolio aesthetic — fixed dithered cover-art background (falls back to a demo image), centered refined column, avatar, status, featured links, portfolio galleries + lightbox, fixed-price commission menu, Elsewhere links, Mirae footer, fade-up motion (reduced-motion safe). Profile avatar/cover upload added to the Studio. Remaining: STUDIO-007 featured-project block, 010 project detail, 012 commission images, 013 sticky mobile CTA (→ Sprint 18), 014 about, 015 FAQ, 017 skeleton, 019 responsive image sizes, 020 a11y audit, lightbox ←/→ nav. Real per-artist dither-on-upload + neutral default cover before deploy. Request drawer = Sprint 16.

- [x] STUDIO-001 Build new public studio shell
- [x] STUDIO-002 Build responsive artist hero
- [x] STUDIO-003 Add avatar and cover rendering
- [x] STUDIO-004 Add status and availability presentation
- [x] STUDIO-005 Add featured links section
- [x] STUDIO-006 Add social links row
- [x] STUDIO-007 Build featured project section
- [x] STUDIO-008 Build responsive portfolio grid
- [x] STUDIO-009 Build artwork lightbox
- [x] STUDIO-010 Build project detail experience
- [x] STUDIO-011 Redesign commission type cards
- [x] STUDIO-012 Add commission representative images (Sprint 17.5 / DEBT-010)
- [x] STUDIO-013 Add persistent mobile commission CTA (Sprint 18 / MOBILE-023)
- [x] STUDIO-014 Add artist about section (Sprint 17.5 / DEBT-011)
- [x] STUDIO-015 Add optional FAQ section (Sprint 17.5 / DEBT-012)
- [x] STUDIO-016 Add Mirae-branded footer
- [x] STUDIO-017 Add loading skeleton
- [x] STUDIO-018 Add not-found and empty states
- [ ] STUDIO-019 Add responsive image sizes (deferred → media-pipeline; = DEBT-013)
- [ ] STUDIO-020 Add accessibility audit (deferred → Sprint 22 trust/a11y)
- [x] STUDIO-021 Add reduced-motion behavior

## Sprint 16 — Integrated commission request flow

Goal: let visitors start a request without breaking the public-studio experience.

- [ ] REQUESTUX-001 Refactor request form into reusable flow
- [ ] REQUESTUX-002 Keep standalone `/@handle/request` route
- [ ] REQUESTUX-003 Add desktop dialog or side panel flow
- [ ] REQUESTUX-004 Add mobile full-screen or bottom-sheet flow
- [ ] REQUESTUX-005 Prefill selected commission type
- [ ] REQUESTUX-006 Add multi-step structure
- [ ] REQUESTUX-007 Add inline validation
- [ ] REQUESTUX-008 Add session draft persistence
- [ ] REQUESTUX-009 Add request reference uploads
- [ ] REQUESTUX-010 Add temporary upload token
- [ ] REQUESTUX-011 Add abandoned upload cleanup
- [ ] REQUESTUX-012 Add summary step
- [ ] REQUESTUX-013 Add polished confirmation
- [ ] REQUESTUX-014 Add rate limiting
- [ ] REQUESTUX-015 Add honeypot
- [ ] REQUESTUX-016 Add Cloudflare Turnstile option
- [ ] REQUESTUX-017 Add duplicate-submission prevention
- [ ] REQUESTUX-018 Add form-start and completion analytics

## Sprint 17 — Appearance editor & live preview

Goal: meaningful artist expression through curated customization.

- [x] CUSTOM-001 Create studio appearance model
- [x] CUSTOM-002 Add accent presets (wired in Sprint 17.5 / DEBT-014)
- [x] CUSTOM-003 Add typography presets (wired in Sprint 17.5 / DEBT-015)
- [x] CUSTOM-004 Add hero layout options (wired in Sprint 17.5 / DEBT-016)
- [x] CUSTOM-005 Add portfolio layout options
- [x] CUSTOM-006 Add image-radius presets
- [x] CUSTOM-007 Add section visibility controls
- [x] CUSTOM-008 Add section ordering (Sprint 17.5 / DEBT-007)
- [x] CUSTOM-009 Build desktop split preview
- [x] CUSTOM-010 Build mobile Edit and Preview tabs (Sprint 18 / MOBILE-022)
- [ ] CUSTOM-011 Add unsaved-change detection (deferred)
- [ ] CUSTOM-012 Add reset-to-published action (deferred)
- [ ] CUSTOM-013 Add save-draft action (deferred)
- [ ] CUSTOM-014 Add explicit publish action (deferred)
- [ ] CUSTOM-015 Add accessible contrast validation (deferred)
- [x] CUSTOM-016 Add appearance migration defaults

Completion notes (Sprint 17): `StudioAppearance` model + `normalizeAppearance`
server validator (`packages/shared`); `appearance` jsonb column (migration 0006);
PATCH `/artists/me` accepts appearance; public payload normalizes it. Editor
(`AppearanceEditor`) exposes accent/typography/hero/portfolio layout, image
corners and section-visibility toggles. Studio-page redesign: top segmented tabs
(Profile / Portfolio / Links / Commissions / Appearance) + 50/50 editor↔live
`/@handle` iframe preview, harmonized editor headers. Visually applied so far:
portfolio layout, image radius, section visibility, featured-first ordering.
Deferred: visual wiring of accent/typography/hero, manual section ordering,
mobile edit/preview tabs (→ S18), unsaved-change/reset/save-draft/publish flow
(save is live), contrast validation.

## Sprint 17.5 — Deferred polish (debt burn-down)

Goal: burn down genuine polish debt that improves already-shipped pages and has
no themed sprint to fold into. Themed deferrals stay with their sprint (mobile →
18, security/a11y → 22, SEO/analytics → 19). Large feature-shaped deferrals are
**not** here: request-flow v2 (`REQUESTUX-001..009/012/013`) and the
draft/publish state machine (`CUSTOM-011..014`) keep their own future sprints.

Portfolio manager

- [x] DEBT-001 (PORTUI-008) Add project cover selection
- [x] DEBT-002 (PORTUI-010) Add alt-text editing
- [x] DEBT-003 (PORTUI-014) Add upload retry and failure states

Ordering (drag-and-drop family)

- [x] DEBT-004 (PORTUI-005) Add project drag-and-drop ordering
- [x] DEBT-005 (PORTUI-007) Add asset ordering
- [x] DEBT-006 (LINKS-010) Add link drag-and-drop ordering
- [x] DEBT-007 (CUSTOM-008) Add section ordering (page-block order via appearance.sectionOrder)

Links polish

- [x] DEBT-008 (LINKS-012) Add platform icon mapping
- [x] DEBT-009 (LINKS-013/014/015) Add link card variants (simple / featured / media — media falls back to card until link images land)

Public studio polish

- [x] DEBT-010 (STUDIO-012) Add commission representative images
- [x] DEBT-011 (STUDIO-014) Add artist about section
- [x] DEBT-012 (STUDIO-015) Add optional FAQ section
- [ ] DEBT-013 (STUDIO-019) Add responsive image sizes (deferred → media-pipeline: needs Worker-side resize / Cloudflare Images)

Appearance visual wiring

- [x] DEBT-014 (CUSTOM-002) Apply accent preset to public page
- [x] DEBT-015 (CUSTOM-003) Apply typography preset to public page
- [x] DEBT-016 (CUSTOM-004) Apply hero layout to public page

Data

- [ ] DEBT-017 (PORTFOLIO-012) Add image dimension metadata (deferred → media-pipeline: width/height columns exist but need Worker-side decode to populate)
- [x] DEBT-018 (PORTFOLIO-016) Add migration and demo seed

Completion notes (Sprint 17.5): burned down deferred polish debt. Shipped —
appearance visual wiring (accent/typography/hero) + accent spread across the
public page; platform link icons + link card variants; per-image alt-text;
upload retry/failure states; drag-and-drop reordering (projects, assets, links)
via motion Reorder; public-page section ordering; artist About + FAQ (accordion);
commission representative images; project cover selection (cover-first ordering);
extended dev seed with links + portfolio + about/FAQ. Deferred to a future
**media-pipeline** ticket: DEBT-013 responsive image sizes and DEBT-017 image
dimension metadata — both need Worker-side image decode/resize (Cloudflare
Images), out of scope here. Migrations 0007 (about/faq), 0008 (commission image),
0009 (project cover) applied.

## Sprint 18 — Mobile product experience

Goal: make the private app and public experience genuinely mobile-first **and polished to a professional bar** (premium on a phone, not merely responsive).

- [x] MOBILE-001 Add bottom navigation
- [x] MOBILE-002 Add mobile header
- [x] MOBILE-003 Add safe-area support
- [x] MOBILE-004 Add mobile More menu
- [x] MOBILE-005 Adapt search and notifications
- [x] MOBILE-006 Handle virtual keyboard correctly
- [x] MOBILE-007 Remove hover-only interactions
- [x] MOBILE-008 Redesign Overview for mobile
- [x] MOBILE-009 Make Queue default to grouped list
- [x] MOBILE-010 Keep board as optional mobile view
- [x] MOBILE-011 Convert commission detail to full-screen mobile route or sheet
- [x] MOBILE-012 Add sticky detail actions
- [x] MOBILE-013 Redesign Requests list and detail
- [x] MOBILE-014 Add sticky Accept and Decline actions
- [x] MOBILE-015 Optimize Clients
- [x] MOBILE-016 Optimize Deliveries
- [x] MOBILE-017 Optimize quote builder
- [x] MOBILE-018 Optimize payment controls
- [x] MOBILE-019 Optimize portal and delivery pages
- [x] MOBILE-020 Add touch portfolio ordering (motion Reorder — pointer/touch)
- [x] MOBILE-021 Add gallery and camera upload (native file input, incl. PORTUI-017)
- [x] MOBILE-022 Add Edit and Preview switch (folds CUSTOM-010, LINKS-017)
- [x] MOBILE-023 Add public sticky CTA (folds STUDIO-013)
- [x] MOBILE-024 Add swipe lightbox
- [~] MOBILE-025 Optimize multi-step request form (mobile-optimized full-screen drawer; true multi-step → REQUESTUX)
- [ ] MOBILE-026 Add responsive R2 images (deferred → media-pipeline, with DEBT-013/017)
- [x] MOBILE-027 Add lazy loading (galleries + asset tiles use loading="lazy")
- [x] MOBILE-028 Prevent layout shifts (fixed aspect-ratio containers + sized media)
- [ ] MOBILE-029 Test slow mobile connections (manual device QA)
- [ ] MOBILE-030 Audit thumb reachability (manual device QA)
- [ ] MOBILE-031 Audit iPhone Safari (manual device QA)
- [ ] MOBILE-032 Audit Android Chrome (manual device QA)
- [ ] MOBILE-033 Audit 320 px viewport (manual device QA)
- [ ] MOBILE-034 Audit landscape mode (manual device QA)
- [x] MOBILE-035 Elevate Overview into a real mobile dashboard (KPI cards, trend, hierarchy)
- [x] MOBILE-036 Unify density, spacing scale and typography across mobile screens
- [x] MOBILE-037 Complete empty / loading (skeleton) / error states everywhere
- [x] MOBILE-038 Brand motion pass (press feedback, transitions, Loader; reduced-motion safe)

Completion notes (Sprint 18): mobile-first shell + premium on both platforms.
Shipped — bottom nav, mobile header (mark + page), safe-area (viewport-fit=cover
+ insets), mobile overflow menu (search/sign-out), mobile-adapted dialogs,
virtual-keyboard handling, removal of hover-only controls, tighter global mobile
gutter (px-4→sm:px-6). Page work: Overview dashboard (KPI cards with real
sublabels + highlighted actionable stat); Queue defaults to grouped list on
phones (board optional); Requests/Clients/Deliveries responsive; commission +
request detail as full-screen sheets with safe-area sticky actions; quote /
payment / portal / delivery mobile-optimized. Touch drag reordering (motion
Reorder), gallery/camera upload, studio-page Edit/Preview switch (folds
CUSTOM-010 + LINKS-017), persistent public request CTA (folds STUDIO-013), swipe
lightbox. Perf: lazy loading + CLS-safe aspect containers. Polish: global Button
press feedback (reduced-motion safe), unified density via shared PageHeader /
cards / gutters, error+loading+empty states across list screens and managers.
Deferred → media-pipeline: MOBILE-026 responsive R2 images (with DEBT-013/017).
Pending manual device QA: MOBILE-029..034 (slow connections, thumb reach, iPhone
Safari, Android Chrome, 320px, landscape).

## Sprint 19 — Sharing, SEO & analytics

Goal: make each public studio attractive to share and measurable without invasive tracking.

- [~] SHARE-001 Generate dynamic artist OG images (og:image = cover/avatar now; composited card → media-pipeline)
- [ ] SHARE-002 Generate project OG images (→ media-pipeline, needs image renderer)
- [x] SHARE-003 Add canonical URLs
- [x] SHARE-004 Add structured metadata
- [x] SHARE-005 Add sitemap strategy
- [x] SHARE-006 Add robots controls
- [x] SHARE-007 Add indexing toggle for closed studios
- [x] SHARE-008 Add social preview in Studio editor
- [x] SHARE-009 Add studio-view analytics
- [x] SHARE-010 Add unique-session estimate
- [x] SHARE-011 Add link-click analytics
- [x] SHARE-012 Add request-start analytics
- [x] SHARE-013 Add request-conversion analytics
- [ ] SHARE-014 Add most-viewed projects (deferred — needs per-project view events)
- [x] SHARE-015 Add privacy-friendly referrer reporting
- [x] SHARE-016 Add custom social title and description

Completion notes (Sprint 19): public studios are now discoverable + shareable.
Worker injects per-studio SEO/OG metadata into the real index.html (title,
description, canonical, robots noindex-when-closed, Open Graph, Twitter card,
ProfilePage JSON-LD); og:image = artist cover/avatar/default. Added /robots.txt
+ dynamic /sitemap.xml (non-closed studios). Landing/base document got proper
default OG tags. Privacy-friendly analytics (no cookies/PII): studio_events +
ingestion (view/link/request funnel, daily IP+UA hash for unique views, referrer
host only) + owner GET /api/analytics + an Insights tab (KPIs, 14-day chart, top
referrers). Custom social title/description per studio (override defaults) with a
live share-preview card in the profile editor. Deferred → media-pipeline:
SHARE-001/002 composited OG image cards. Deferred: SHARE-014 most-viewed
projects (needs per-project view events). Migrations 0010 (events) + 0011
(meta_title/meta_description).

## Sprint 20 — Onboarding & guided launch

Goal: take a new user from signup to a published, shareable studio in one journey.

- [ ] ONBOARD-001 Redesign signup-to-studio journey
- [ ] ONBOARD-002 Add resumable onboarding state
- [ ] ONBOARD-003 Add handle selection
- [ ] ONBOARD-004 Add profile setup
- [ ] ONBOARD-005 Add first commission type
- [ ] ONBOARD-006 Add first portfolio upload
- [ ] ONBOARD-007 Add first links
- [ ] ONBOARD-008 Add appearance preset selection
- [ ] ONBOARD-009 Add studio preview
- [ ] ONBOARD-010 Add publish step
- [ ] ONBOARD-011 Add copy-link and share step
- [ ] ONBOARD-012 Add dashboard checklist
- [ ] ONBOARD-013 Add dismissible dashboard tour
- [ ] ONBOARD-014 Add contextual empty-state actions
- [ ] ONBOARD-015 Add onboarding analytics

## Sprint 21 — Premium client portal

Goal: bring the client-facing experience to the quality of the public studio.

- [ ] CLIENTUX-001 Redesign client portal shell
- [ ] CLIENTUX-002 Add artist branding
- [ ] CLIENTUX-003 Improve milestone timeline
- [ ] CLIENTUX-004 Add structured feedback threads
- [ ] CLIENTUX-005 Add revision rounds
- [ ] CLIENTUX-006 Add artist responses
- [ ] CLIENTUX-007 Add thread open and resolved states
- [ ] CLIENTUX-008 Add quote acceptance
- [ ] CLIENTUX-009 Add quote decline with note
- [ ] CLIENTUX-010 Add delivery acknowledgement
- [ ] CLIENTUX-011 Add secure reference gallery
- [ ] CLIENTUX-012 Add token rotation
- [ ] CLIENTUX-013 Add token revocation
- [ ] CLIENTUX-014 Add mobile portal polish
- [ ] CLIENTUX-015 Add accessibility audit

## Sprint 22 — Trust, security & beta hardening

Goal: prepare Mirae for real artists, real clients and real files.

- [ ] TRUST-001 Threat-model public upload endpoints
- [ ] TRUST-002 Add upload quotas
- [ ] TRUST-003 Add upload type and resolution limits
- [ ] TRUST-004 Add orphan cleanup jobs
- [ ] TRUST-005 Audit private file access
- [ ] TRUST-006 Add global rate limiting
- [ ] TRUST-007 Audit Better Auth configuration
- [ ] TRUST-008 Audit portal-token entropy
- [ ] TRUST-009 Add token revocation
- [ ] TRUST-010 Add data export
- [ ] TRUST-011 Add account deletion
- [ ] TRUST-012 Add privacy policy
- [ ] TRUST-013 Add terms of service
- [ ] TRUST-014 Add structured audit logs
- [ ] TRUST-015 Add dependency scanning
- [ ] TRUST-016 Add secret scanning
- [ ] TRUST-017 Add critical-path automated tests
- [ ] TRUST-018 Add deploy smoke test
- [ ] TRUST-019 Add backup and recovery documentation
- [ ] TRUST-020 Add incident response checklist

## Sprint 23 — Closed artist beta

Goal: validate the complete experience with working artists before expanding features or charging.

- [ ] BETA-001 Define tester profiles
- [ ] BETA-002 Recruit 5–10 artists
- [ ] BETA-003 Create interview script
- [ ] BETA-004 Add in-app feedback capture
- [ ] BETA-005 Observe studio setup
- [ ] BETA-006 Observe mobile setup
- [ ] BETA-007 Observe a real request workflow
- [ ] BETA-008 Measure activation
- [ ] BETA-009 Measure portfolio-to-request conversion
- [ ] BETA-010 Classify issues by severity and frequency
- [ ] BETA-011 Run prioritized beta-fix sprint
- [ ] BETA-012 Ask permission for testimonials
- [ ] BETA-013 Identify paid-plan boundaries

## Sprint 24 — Commission operations polish

Goal: improve the private workflow from validated beta feedback **and take the whole dashboard to a professional, finished bar** (full visual/interaction polish — premium product, not MVP).

- [ ] OPS-001 Add editable commission metadata
- [ ] OPS-002 Add internal artist notes
- [ ] OPS-003 Add custom deadlines
- [ ] OPS-004 Add revision counters
- [ ] OPS-005 Add reusable quote presets
- [ ] OPS-006 Add reusable response templates
- [ ] OPS-007 Add manual queue ordering
- [ ] OPS-008 Add archive flow
- [ ] OPS-009 Add cancellation flow
- [ ] OPS-010 Add richer activity events
- [ ] OPS-011 Add client history
- [ ] OPS-012 Add justified bulk actions
- [ ] OPS-013 Redesign Overview into a real dashboard (KPI cards, trends, needs-attention, activity)
- [ ] OPS-014 Unify density, spacing, typography + adopt the shared @mirae/ui components (Select, Switch, Avatar, Skeleton, Progress, AlertDialog) across every screen
- [ ] OPS-015 Complete empty / loading / error / success states everywhere
- [ ] OPS-016 Brand motion & press-feedback pass (shared easing; reduced-motion safe)
- [ ] OPS-017 Full accessibility + keyboard-navigation pass
- [ ] OPS-018 Apply Mirae identity consistently in-app (sidebar, loaders, favicons, emails)

## Sprint 25 — Subscription foundation

Goal: introduce subscription billing only after repeated value is validated. **Mirae never takes a commission percentage.**

- [ ] BILLING-001 Define Free and Pro plans
- [ ] BILLING-002 Add subscription tables
- [ ] BILLING-003 Integrate Stripe Checkout
- [ ] BILLING-004 Add Stripe customer portal
- [ ] BILLING-005 Add webhook processing
- [ ] BILLING-006 Add server-side entitlements
- [ ] BILLING-007 Add billing settings
- [ ] BILLING-008 Add failed-payment handling
- [ ] BILLING-009 Add upgrade prompts
- [ ] BILLING-010 Add billing emails
- [ ] BILLING-011 Add subscription analytics
- [ ] BILLING-012 Add support documentation
