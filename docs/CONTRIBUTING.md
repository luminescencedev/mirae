# Contributing

> Local workflow, preview, checks, and commit/PR rules. `docs/SPRINTS.md` is the ticket queue; docs are the source of truth after init.

## Prerequisites

```txt
Node.js 24.x (Active LTS)
pnpm 11.10.0
git
```

## Setup

```bash
pnpm install
```

After install, verify pinned versions:

```bash
pnpm ls --depth 0 -r
```

Confirm they match `docs/VERSIONS.md`. Flag any mismatch instead of continuing.

## Local dev

```bash
pnpm dev
```

Runs both processes in parallel via `turbo run dev`:

```txt
web:  vite dev      -> http://localhost:5173   (strictPort; proxies /api/* to wrangler)
api:  wrangler dev  -> http://localhost:8787    (health: http://localhost:8787/health)
```

Database (from Sprint 3 onward — Neon dev branch, no Docker):

```bash
pnpm db:migrate
pnpm db:seed
pnpm dev
```

## Checks (run before marking a ticket done)

```bash
pnpm lint
pnpm typecheck
pnpm build
```

## Definition of done — ticket

```txt
Code implemented.
TypeScript has no blocking errors.
Lint passes or known issues documented.
Build passes or known issues documented.
UI matches current design direction/mockup.
No unrelated files changed.
Docs updated if architecture or behavior changed.
Preview instructions provided.
User can review locally.
```

## Definition of done — sprint

```txt
All sprint tickets meet acceptance criteria.
End-to-end flow works for that sprint scope.
docs/SPRINTS.md updated.
Known issues listed.
Next sprint clearly identified.
```

## Preview & validation rule

The user validates **visually** by launching the local preview. Do **not** push until the user approves.

Approval phrases: `ship it` · `push` · `go commit` · `validé` · `validé push` · `ok commit` · `ok ouvre la pr` · `c'est bon pour moi` · `j'aime bien push`.

If the user dislikes the preview, ask what to adjust or apply the explicit feedback.

## Commit workflow (only after approval)

```txt
1. git status
2. Show concise diff summary
3. Create a focused commit
4. Push branch
5. Open/update draft PR if requested
6. Do NOT merge — user handles merge
```

Commit style:

```txt
feat(web): add landing hero mockup
feat(api): add commission requests endpoints
feat(db): add commission schema
fix(web): correct app shell spacing
chore(repo): setup pnpm monorepo
```

Branch naming:

```txt
feat/sprint-0-repo-foundation
feat/sprint-1-ui-foundation
feat/sprint-5-request-inbox
fix/app-shell-sidebar
```

## Guardrails

```txt
One ticket at a time unless the user approves more.
Do not silently change architecture.
Do not introduce a new UI library / framework / backend without asking.
Do not copy shadcn blocks wholesale.
Do not add marketplace or discovery/matching features in MVP.
Do not add AI features unless explicitly requested.
Do not push without approval. Do not merge PRs.
Do not reintroduce Express, React Router, Vercel code, or a second Worker (locked — see docs/DECISIONS.md).
```
