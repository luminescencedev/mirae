# Mirae Sprints

> Ticket queue and completion tracker. Update checkboxes as tickets complete. Source of truth for "next ticket".

## Current sprint

Sprint 3 — Database and auth foundation

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

## Sprint 3 — Database and auth foundation

- [x] DB-001 Create Neon project + dev branch, configure Drizzle
- [x] DB-002 Create MVP schema
- [x] DB-003 Generate migrations
- [x] DB-004 Add seed script
- [ ] AUTH-001 Configure Better Auth inside the Hono app
- [ ] AUTH-002 Add login/signup pages
- [ ] AUTH-003 Add protected app routes
- [ ] AUTH-004 Add onboarding artist profile creation

## Sprint 4 — Commission types and public page

- [ ] CT-001 Add commission types API
- [ ] CT-002 Add commission types UI
- [ ] CT-003 Add artist profile editor basics
- [ ] CT-004 Connect public @artist page to DB
- [ ] CT-005 Add open/closed/waitlist state
- [ ] CT-006 Add social bot user-agent detection + dynamic OG HTML for /@:handle

## Sprint 5 — Request form and inbox

- [ ] REQ-001 Connect public request form to API
- [ ] REQ-002 Create commission request records
- [ ] REQ-003 Build request inbox API
- [ ] REQ-004 Connect request inbox UI
- [ ] REQ-005 Build request detail panel
- [ ] REQ-006 Add accept/decline actions

## Sprint 6 — Queue and commissions

- [ ] COM-001 Create commissions API
- [ ] COM-002 Convert request to commission
- [ ] COM-003 Build commission queue API
- [ ] COM-004 Connect queue UI to backend
- [ ] COM-005 Add status update action
- [ ] COM-006 Connect commission detail panel
- [ ] COM-007 Add basic activity log

## Sprint 7 — Quotes and payment status

- [ ] QUOTE-001 Add quote model/API
- [ ] QUOTE-002 Build quote builder UI
- [ ] QUOTE-003 Add quote line items
- [ ] QUOTE-004 Add send quote placeholder
- [ ] QUOTE-005 Add manual payment status

## Sprint 8 — Client portal and delivery

- [ ] PORTAL-001 Generate portal token
- [ ] PORTAL-002 Build /portal/:token
- [ ] PORTAL-003 Add status timeline
- [ ] PORTAL-004 Add client feedback placeholder
- [ ] DELIV-001 Add delivery model
- [ ] DELIV-002 Build /delivery/:token
- [ ] DELIV-003 Wire file uploads/downloads to Cloudflare R2
- [ ] DELIV-004 Add mark delivered action

## Sprint 9 — Polish and beta readiness

- [ ] POLISH-001 Add empty states
- [ ] POLISH-002 Add loading states
- [ ] POLISH-003 Add error states
- [ ] POLISH-004 Add toast feedback
- [ ] POLISH-005 Improve keyboard/focus states
- [ ] POLISH-006 Responsive pass
- [ ] POLISH-007 Demo seed data
- [ ] POLISH-008 Landing waitlist CTA
- [ ] POLISH-009 Wire Resend for real notification emails

## Backlog — future UX (not scheduled)

- **Onboarding flow + first-run tour**: make the entry journey smooth and continuous — sign up → login → arriving in the app (not isolated pages) — and add a dismissible first-run **guided tour** on the dashboard for new artists. Design before building; revisit when auth (Sprint 3) + app screens are further along.
- **Command palette (⌘K)**: wire the sidebar Search (and ⌘K) to a `cmdk`-based command palette — quick nav + actions across the app. Add `cmdk` (pin version) when built.

## Notes

- Init (2026-07-09): docs created, master rewritten into index. Dev runtime = two-process concurrently (see DECISIONS). Versions pinned per DECISIONS.
