# Mirae — Claude Code Workflow Index

## Product

**Mirae** is a private commission studio for digital artists.

> Mirae helps digital artists manage requests, quotes, queues, revisions and deliveries in one calm workspace.

Domains: marketing `usemirae.com` · app `app.usemirae.com` · public artist pages `usemirae.com/@artist` · request form `usemirae.com/@artist/request` · client portal `usemirae.com/portal/:token` · delivery `usemirae.com/delivery/:token`.

Positioning: **Calendly, not VGen.** Mirae takes over _after_ an artist and client already agreed to work together — it never helps find clients. Not a marketplace, not a social network, not a discovery/matching platform, not AI-first, not escrow. Subscription-only business model; Mirae never takes a cut of commission revenue.

## Source of truth

After initialization, these docs are canonical (this file is only an index):

- Architecture: `docs/ARCHITECTURE.md` — repo structure, single-Worker deployment, module rules, endpoints
- Design system: `docs/DESIGN_SYSTEM.md` — visual direction, palette, components, UI rules
- Sprints: `docs/SPRINTS.md` — sprint roadmap, ticket queue, completion tracker
- Database: `docs/DATABASE.md` — MVP schema, Neon + Drizzle conventions, migrations
- Decisions: `docs/DECISIONS.md` — stack, single-Worker reasoning, business model, dev-runtime choice
- Versions: `docs/VERSIONS.md` — pinned dependency versions (exact, no `^`/`latest`)
- Workflow: `docs/CONTRIBUTING.md` — local dev, preview, checks, commit/PR rules

## Daily commands

```txt
ticket suivant     -> next unchecked ticket in docs/SPRINTS.md; implement only that one
feature suivante   -> next coherent feature; if multi-ticket, slice and do smallest useful part first
continue sprint    -> continue current sprint from next unchecked ticket
status             -> current sprint, done tickets, next ticket, blockers, run commands
preview            -> run/provide local preview commands; say what to inspect
ship it            -> if checks pass and preview approved: commit, push, open/update draft PR (never merge)
stop               -> stop coding, summarize current state
```

## Workflow loop

```txt
1. Inspect repo state.
2. Read docs/SPRINTS.md (+ ARCHITECTURE, DESIGN_SYSTEM as relevant).
3. Identify current sprint and next unchecked ticket.
4. Restate the selected ticket (scope + acceptance + plan).
5. Implement only that ticket, unless blocked.
6. Run checks (lint, typecheck, build).
7. Start/describe local preview (vite dev + wrangler dev).
8. Summarize changes and validation steps.
9. Wait for user approval before commit/push/PR.
10. On approval: focused commit, push branch, open/update draft PR. Do not merge.
```

Ticket start format: `Current sprint` / `Selected ticket` / `Scope` / `Acceptance criteria` / `Plan`.
After impl: `Implemented` / `Checks (lint/typecheck/build pass|fail)` / `Preview` / "Please review locally. If approved, say: ship it."

## Non-negotiables

```txt
pnpm. Turborepo monorepo.
Vite + React + TanStack Router (NOT React Router).
Hono (NOT Express) for the API.
Single Cloudflare Worker serving both the built web app (static assets) and the Hono API.
PostgreSQL via Neon serverless driver (NOT raw TCP / self-hosted).
Drizzle ORM. Better Auth. Cloudflare R2 for files. Resend for email.
Stripe for subscription billing; Stripe Connect is post-MVP.
Radix primitives for accessibility; NO shadcn blocks; keep UI custom and premium.
No marketplace / discovery / matching in MVP. No AI features unless requested.
Do not push without approval. Do not merge PRs.
Pin exact dependency versions per docs/DECISIONS.md.
```

Docs are the source of truth after init. If a decision changes, update the relevant `docs/*` file (and record architectural changes in `docs/DECISIONS.md`) — not this index.
