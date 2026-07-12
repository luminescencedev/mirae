# Decisions

> Architectural and product decisions with rationale. Append new decisions; do not rewrite history.

## 2026-07-09 — Hono + single Cloudflare Worker (not Express/Vercel)

**Decision:** API built with Hono, deployed as a single Cloudflare Worker that also serves the built Vite frontend (static assets). One `wrangler.toml`, one `wrangler deploy`.

**Reason:** Express cannot run in the Workers edge runtime (no Node APIs). A single Worker (not two) avoids duplicating DB access or an internal network hop for the `/@:handle` OG bot-detection logic, which needs the request, the DB, and the static-asset fallback in one place. **Locked** — do not reintroduce Express, React Router, Vercel-specific code, or a second deployable Worker without explicit approval.

## 2026-07-09 — PostgreSQL via Neon serverless driver

**Decision:** PostgreSQL on Neon, accessed via `@neondatabase/serverless` (HTTP/WebSocket). Local dev uses a Neon branch, not local Docker Postgres.

**Reason:** Workers cannot open raw TCP connections, so `pg`/`postgres.js` are impossible in prod. Developing against a real Neon branch avoids driver-behavior mismatch. Neon instant branching gives disposable per-preview DBs.

## 2026-07-09 — Radix primitives without shadcn blocks

**Decision:** Radix for accessible behavior; custom Mirae visuals on top. No shadcn prebuilt blocks.

**Reason:** Accessibility without inheriting generic shadcn aesthetics. Mirae must look premium and custom.

## 2026-07-09 — Business model: subscription only

**Decision:** Mirae monetizes via subscription (Stripe Billing). It never takes a cut of an artist's commission revenue. Stripe Connect (artist payouts) and escrow are explicitly post-MVP. Build free/manual payment status first; wire Stripe Billing once ready to charge.

**Reason:** Deliberate differentiator vs VGen (which charges 5% + processing and gatekeeps sellers behind invite codes). Mirae is Calendly-not-VGen: it manages the relationship after a client already exists; it never finds clients.

## 2026-07-09 — Pinned dependency versions for Sprint 0

**Decision:** Pin exact versions (no `^`, no `latest`) across all workspaces. Node 24.x engines target (`"node": ">=24"`), pnpm 11.10.0. Full authoritative list: **`docs/VERSIONS.md`**.

Key pins:

```txt
typescript 6.0.3        (NOT 7.x latest — TS7 GA'd 2026-07-08; ecosystem tooling not caught up. Revisit later.)
eslint 10.6.0           prettier 3.9.4          turbo 2.10.4
vite 8.1.3              react 19.2.7            react-dom 19.2.7
@tanstack/react-router 1.170.17   @tanstack/router-plugin 1.168.19
@tanstack/react-query 5.101.2     @tanstack/react-table 8.21.3
tailwindcss 4.3.2       motion 12.42.2          react-hook-form 7.81.0
zod 4.4.3               (Zod v4 — write validators against v4 docs, not v3 patterns)
lucide-react 1.23.0     class-variance-authority 0.7.1  tailwind-merge 3.6.0  clsx 2.1.1  date-fns 4.4.0
Radix: dialog 1.1.19  dropdown-menu 2.1.20  popover 1.1.19  tooltip 1.2.12  tabs 1.1.17
       select 2.3.3   switch 1.3.3          checkbox 1.3.7  toast 1.2.19
hono 4.12.28            @hono/zod-validator 0.8.0
drizzle-orm 0.45.2      drizzle-kit 0.31.10   @neondatabase/serverless 1.1.0
better-auth 1.6.23      stripe 22.3.0         resend 6.17.2
wrangler 4.107.1        @cloudflare/workers-types 5.20260708.1
concurrently 10.0.3
```

**Reason:** Reproducible installs; avoid a bleeding-edge major (TS7) breaking ecosystem tooling mid-sprint. After `pnpm install`, run `pnpm ls --depth 0 -r` and confirm installed versions match; flag mismatches instead of continuing silently.

## 2026-07-09 — Dev runtime: two-process, orchestrated by Turborepo (not concurrently), over @cloudflare/vite-plugin

**Decision:** Local dev runs two processes — `vite dev` (web, :5173 `strictPort`, proxies `/api/*`) and `wrangler dev` (Hono/API, :8787) — orchestrated by **`turbo run dev`** (each app's persistent `dev` task run in parallel). `@cloudflare/vite-plugin 1.43.1` was considered and **deferred**.

**Reason:** The two-process setup maps directly onto the documented `apps/web` (builds to `dist/`) + `apps/api` (the Worker, `assets.directory = ../web/dist`) split and keeps the workspace boundaries clean. The vite-plugin (workerd inside Vite, single `vite dev`, tighter prod parity) would blur the app boundary by pulling the worker entry into the web Vite project.

**Update (REPO-006):** originally recorded as `concurrently 10.0.3`, but Turborepo already runs both persistent `dev` tasks in parallel from one `pnpm dev`, so `concurrently` was dropped as a redundant dependency. Ports pinned deterministically (`strictPort` on vite, `[dev] port = 8787` in `wrangler.toml`). Revisit `@cloudflare/vite-plugin` if dev/prod parity issues appear; if adopted, update `docs/CONTRIBUTING.md` + `docs/ARCHITECTURE.md` and record here.

## 2026-07-10 — Design system: shadcn-style base, clean light SaaS, Inter, Hugeicons

**Decision (Sprint 1, UI-003):**

- **Component base = shadcn/ui architecture** (Radix primitives + `cva` + `cn`), restyled onto Mirae tokens — not copied blocks. `Button` follows shadcn's variants/sizes/`asChild` API. Custom Mirae visuals ride on top.
- **Direction = clean light SaaS** at shadcn/Linear polish (thin borders, small radii, calm whitespace, pastel tag chips, status dots). The heavy Awwwards **double-bezel is NOT the default** — kept only behind an optional `bezel` prop for a rare hero surface. (Supersedes the earlier "no double bezel" absolute and the agency-dark exploration.)
- **Light theme only for now.** Dark tokens stay in `globals.css` (dormant `.dark` overrides + semantic tokens) so dark can be switched on later without touching components.
- **Typography = Inter**, self-hosted locally (`apps/web/src/assets/fonts`, 400/500/600). Overrides the high-end skill's Inter ban — it's the chosen typeface.
- **Icons = Hugeicons (Stroke Rounded)** as the single house family via a `@mirae/ui` `Icon` wrapper (default 20 / stroke 1.7; 16 / 1.8 in buttons). `react-icons` for brand logos only. `lucide-react` dropped. Bespoke crafted marks (`BranchReturnIcon`, `EnterKeyIcon`) kept as accents.
- **Motion** per emil-design-eng / apple-design skills (installed user-global, see `CLAUDE.md`): strong custom easing tokens, scale-on-press, spring-based `HoverBarList` (one bar slides behind the hovered row; works horizontal tabs + vertical lists, no default selection).

**Reason:** the user's dashboard references (Taskk, widelab, logip, Shopeers) are clean light premium SaaS; shadcn gives a reliable, familiar, restyle-able base while Hugeicons + Inter + the motion details supply a distinctive, non-generic identity.

## 2026-07-12 — Post-MVP product direction (locked)

The MVP (Sprints 0–9) + a Sprint 10 audit are shipped and deployed. The next cycle is locked to a **product direction**, not just more features. Canonical detail: [`POST_MVP_VISION.md`](../vision/POST_MVP_VISION.md), sequencing in [`POST_MVP_ROADMAP.md`](../roadmap/POST_MVP_ROADMAP.md).

- **Scope grows to "public + private operating system for independent artists"**: a portfolio-first public studio + link-in-bio hub + structured request intake, on top of the existing private commission workflow and client portal.
- **Still not**: marketplace, discovery feed, escrow, social network, generic website builder, generic Linktree clone, or any product taking a % of commission revenue. **Subscription-first, workflow-first.**
- **Sequencing is deliberate**: identity → portfolio → links → public studio → request flow → appearance → mobile → sharing/SEO → onboarding → client portal → security/beta → beta → ops polish → **billing last** (Sprint 25). Billing (Stripe) comes only after repeated value is validated; it is **not implemented today**.
- **Locked stack is unchanged**: pnpm+Turborepo, Vite+React+TanStack Router, Hono single Cloudflare Worker, Neon+Drizzle, Better Auth, R2, Resend, Radix-based `@mirae/ui`, light-first visuals, Hugeicons. New work extends this; it does not replace it.
- **Mobile is first-class** and **public pages are portfolio-first** — treated as design constraints from the start, not later patches (see `MOBILE_PRODUCT_SPEC.md`, `PUBLIC_STUDIO_SPEC.md`).
