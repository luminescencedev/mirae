# CLAUDE.md

Operating guide for Claude Code in this repo. Docs in `docs/` are the source of truth; this file is the entry point.

## Product

**Mirae** — a private commission studio for digital artists.

> Mirae helps digital artists manage requests, quotes, queues, revisions and deliveries in one calm workspace.

Positioning: **Calendly, not VGen.** Mirae does not discover or match artists and clients. Artists bring their own audience; Mirae turns that audience into structured requests and manages the relationship from intake to delivery (the public studio + request intake intentionally happen _before_ final agreement — Mirae just never finds the clients). Not a marketplace, social network, discovery/matching platform, AI-first product, or escrow. Subscription-only; never takes a cut of commission revenue.

## Source of truth (`docs/`)

- `docs/architecture/ARCHITECTURE.md` — repo structure, single-Worker deployment, module rules, endpoints
- `docs/product/DESIGN_SYSTEM.md` — visual direction, palette, components, quality bar
- `docs/roadmap/SPRINTS.md` — sprint roadmap + ticket queue (**pick next ticket here**)
- `docs/architecture/DATABASE.md` — MVP schema, Neon + Drizzle conventions
- `docs/decisions/DECISIONS.md` — stack, single-Worker reasoning, business model, dev-runtime choice
- `docs/architecture/VERSIONS.md` — **pinned dependency versions** (exact, no `^`/`latest`)
- `docs/architecture/CONTRIBUTING.md` — local dev, checks, commit/PR rules
- `MIRAE_CLAUDE_CODE_MASTER.md` — condensed workflow index

## Commands

```txt
ticket suivant / next ticket   -> next unchecked ticket in docs/roadmap/SPRINTS.md; implement only that one
feature suivante               -> next coherent feature; slice if multi-ticket, smallest useful part first
continue sprint                -> continue current sprint from next unchecked ticket
status                         -> current sprint, done tickets, next ticket, blockers, run commands
preview                        -> run/provide local preview commands; say what to inspect
ship it                        -> if checks pass + preview approved: commit, push, open/update draft PR (never merge)
stop                           -> stop coding, summarize state
```

## Skills (`.claude/skills/`)

Encoded procedures for the recurring workflow — invoke the matching one:

- `start-ticket` — env green, pick next ticket in `docs/roadmap/SPRINTS.md`, get on the sprint branch, restate scope, implement only that ticket
- `preview` — run `pnpm dev`, say what to inspect, wait for visual approval
- `ship-it` — after approval: format, checks, tick SPRINTS, focused commit, push, open/update the **draft** PR (never merge)
- `status` — current sprint, done/next ticket, open PR, blockers
- `migration` — Drizzle schema change → generate/review/apply against the Neon branch
- `finish-sprint` — close a sprint: acceptance, e2e, SPRINTS completion notes, refresh PR

### Design references (user-global, not in the repo)

UI work should draw on the design skills installed in the user-global `~/.agents/skills` and `~/.claude/skills` (kept out of the repo on purpose). Lean on them for polish/motion:

- `emil-design-eng` — UI polish, animation decision framework, easing/spring, press feedback
- `apple-design` · `animation-vocabulary` · `review-animations` — motion craft + review
- `ui-ux-pro-max` · `tailwind-design-system` · `interaction-design` · `web-design-guidelines` — components, tokens, a11y

Direction bar: **clean shadcn-level light SaaS** (thin borders, small radii, calm whitespace, pastel tag chips, status dots), premium motion (scale-on-press, strong ease-out). Light theme only for now; dark tokens are kept dormant.

## Workflow loop

```txt
1. Inspect repo state.
2. Read docs/roadmap/SPRINTS.md (+ ARCHITECTURE, DESIGN_SYSTEM, VERSIONS as relevant).
3. Identify current sprint + next unchecked ticket.
4. Restate ticket: scope + acceptance + plan.
5. Implement only that ticket unless blocked.
6. Run checks: pnpm lint / typecheck / build.
7. Start/describe local preview (vite dev + wrangler dev).
8. Summarize changes + validation steps.
9. Wait for user approval before commit/push/PR.
10. On approval: focused commit, push branch, open/update draft PR. Never merge.
```

## Version policy

Pin **exact** versions from `docs/architecture/VERSIONS.md` in every workspace `package.json`. No `^`, no `latest`. Notably: TypeScript **6.0.3** (not 7.x), Node **>=24**, pnpm **11.10.0**, Zod **v4** (v4 syntax, not v3). After `pnpm install`, run `pnpm ls --depth 0 -r` and flag any mismatch vs VERSIONS.md.

## Non-negotiables

```txt
pnpm. Turborepo monorepo.
Vite + React + TanStack Router (NOT React Router).
Hono (NOT Express) for the API.
Single Cloudflare Worker serving built web app (static assets) + Hono API.
PostgreSQL via Neon serverless driver (NOT raw TCP / self-hosted).
Drizzle ORM. Better Auth. Cloudflare R2 for files. Resend for email.
Billing: NONE yet — payment status is manual (`paidCents`); Stripe subscription billing is planned post-MVP (Sprint 25), Stripe Connect is parked (never take a commission cut).
Radix primitives for accessibility; NO shadcn blocks; keep UI custom + premium.
No marketplace / discovery / matching in MVP. No AI features unless requested.
Pin exact dependency versions (docs/architecture/VERSIONS.md).
Do not push without approval. Do not merge PRs. Do not silently change architecture.
```

## Guardrails

One ticket at a time unless approved. Don't reintroduce Express, React Router, Vercel code, or a second deployable Worker (locked — see `docs/decisions/DECISIONS.md`). Don't copy shadcn blocks wholesale. If a decision changes, update the relevant `docs/*` file (architectural changes → `docs/decisions/DECISIONS.md`), not just this file.

## Post-MVP working rules

The MVP is shipped + deployed; the next cycle is a locked product direction (see `docs/vision/POST_MVP_VISION.md`, `docs/roadmap/POST_MVP_ROADMAP.md`). When implementing post-MVP work:

- **Read the vision first.** Before building a new feature, read `docs/vision/POST_MVP_VISION.md` + the relevant spec (`docs/product/PUBLIC_STUDIO_SPEC.md`, `docs/product/MOBILE_PRODUCT_SPEC.md`, `docs/architecture/DATA_AND_API_EXTENSION.md`).
- **Mobile is designed, not patched.** Every screen/flow accounts for mobile from the start (bottom nav, full-screen detail flows, sticky actions, no hover-only controls, keyboard-safe).
- **Public artist pages prioritize artwork.** Portfolio-first hierarchy; link-in-bio features must never reduce the page to a stack of identical buttons.
- **Every upload endpoint** enforces authenticated ownership (or a scoped short-lived token for public uploads), MIME + size limits, and storage cleanup on delete.
- **Never mark planned features as shipped.** Docs distinguish shipped / current / planned. Planned tables, endpoints and UI stay labeled planned until they exist.
- **Preserve locked architecture** (see `docs/decisions/DECISIONS.md`) unless a decision doc explicitly changes it. Don't rewrite the existing Hono route modules into a fictional controller/service/repository layering.
- **Every sprint updates docs, tests and acceptance notes**; keep one source of truth per topic (link between docs, don't duplicate).
- **Billing is last** (Sprint 25) and Mirae never takes a commission percentage.
