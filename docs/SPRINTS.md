# Mirae Sprints

> Ticket queue and completion tracker. Update checkboxes as tickets complete. Source of truth for "next ticket".

## Current sprint

Sprint 1 — Brand UI foundation

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

## Sprint 1 — Brand UI foundation

- [x] UI-001 Add design tokens and global CSS
- [x] UI-002 Add cn utility and component variant helpers
- [ ] UI-003 Build Button, Input, Textarea, Badge, Card, Panel
- [ ] UI-004 Build Radix-based Dialog, Dropdown, Tooltip, Tabs skins
- [ ] UI-005 Build AppShell prototype
- [ ] UI-006 Build Landing hero prototype
- [ ] UI-007 Build dashboard preview mockup with seed data

## Sprint 2 — Static product screens

- [ ] WEB-001 Set up TanStack Router file-based route tree
- [ ] WEB-002 Create marketing routes
- [ ] WEB-003 Create /app layout
- [ ] WEB-004 Create overview screen with mock data
- [ ] WEB-005 Create requests inbox with mock data
- [ ] WEB-006 Create queue screen with mock data
- [ ] WEB-007 Create commission detail panel with mock data
- [ ] WEB-008 Create public artist page mock
- [ ] WEB-009 Create request form mock

## Sprint 3 — Database and auth foundation

- [ ] DB-001 Create Neon project + dev branch, configure Drizzle
- [ ] DB-002 Create MVP schema
- [ ] DB-003 Generate migrations
- [ ] DB-004 Add seed script
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

## Notes

- Init (2026-07-09): docs created, master rewritten into index. Dev runtime = two-process concurrently (see DECISIONS). Versions pinned per DECISIONS.
