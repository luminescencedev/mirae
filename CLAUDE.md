# CLAUDE.md

Operating guide for Claude Code in this repo. Docs in `docs/` are the source of truth; this file is the entry point.

## Product

**Mirae** — a private commission studio for digital artists.

> Mirae helps digital artists manage requests, quotes, queues, revisions and deliveries in one calm workspace.

Positioning: **Calendly, not VGen.** Manages the relationship *after* artist and client already agreed to work together; never finds clients. Not a marketplace, social network, discovery/matching platform, AI-first product, or escrow. Subscription-only; never takes a cut of commission revenue.

## Source of truth (`docs/`)

- `docs/ARCHITECTURE.md` — repo structure, single-Worker deployment, module rules, endpoints
- `docs/DESIGN_SYSTEM.md` — visual direction, palette, components, quality bar
- `docs/SPRINTS.md` — sprint roadmap + ticket queue (**pick next ticket here**)
- `docs/DATABASE.md` — MVP schema, Neon + Drizzle conventions
- `docs/DECISIONS.md` — stack, single-Worker reasoning, business model, dev-runtime choice
- `docs/VERSIONS.md` — **pinned dependency versions** (exact, no `^`/`latest`)
- `docs/CONTRIBUTING.md` — local dev, checks, commit/PR rules
- `MIRAE_CLAUDE_CODE_MASTER.md` — condensed workflow index

## Commands

```txt
ticket suivant / next ticket   -> next unchecked ticket in docs/SPRINTS.md; implement only that one
feature suivante               -> next coherent feature; slice if multi-ticket, smallest useful part first
continue sprint                -> continue current sprint from next unchecked ticket
status                         -> current sprint, done tickets, next ticket, blockers, run commands
preview                        -> run/provide local preview commands; say what to inspect
ship it                        -> if checks pass + preview approved: commit, push, open/update draft PR (never merge)
stop                           -> stop coding, summarize state
```

## Workflow loop

```txt
1. Inspect repo state.
2. Read docs/SPRINTS.md (+ ARCHITECTURE, DESIGN_SYSTEM, VERSIONS as relevant).
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

Pin **exact** versions from `docs/VERSIONS.md` in every workspace `package.json`. No `^`, no `latest`. Notably: TypeScript **6.0.3** (not 7.x), Node **>=24**, pnpm **11.10.0**, Zod **v4** (v4 syntax, not v3). After `pnpm install`, run `pnpm ls --depth 0 -r` and flag any mismatch vs VERSIONS.md.

## Non-negotiables

```txt
pnpm. Turborepo monorepo.
Vite + React + TanStack Router (NOT React Router).
Hono (NOT Express) for the API.
Single Cloudflare Worker serving built web app (static assets) + Hono API.
PostgreSQL via Neon serverless driver (NOT raw TCP / self-hosted).
Drizzle ORM. Better Auth. Cloudflare R2 for files. Resend for email.
Stripe subscription billing; Stripe Connect post-MVP.
Radix primitives for accessibility; NO shadcn blocks; keep UI custom + premium.
No marketplace / discovery / matching in MVP. No AI features unless requested.
Pin exact dependency versions (docs/VERSIONS.md).
Do not push without approval. Do not merge PRs. Do not silently change architecture.
```

## Guardrails

One ticket at a time unless approved. Don't reintroduce Express, React Router, Vercel code, or a second deployable Worker (locked — see `docs/DECISIONS.md`). Don't copy shadcn blocks wholesale. If a decision changes, update the relevant `docs/*` file (architectural changes → `docs/DECISIONS.md`), not just this file.
