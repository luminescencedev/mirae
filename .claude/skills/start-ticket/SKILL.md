---
name: start-ticket
description: Start work on a Mirae ticket cleanly — verify the env is green, pick the next unchecked ticket in docs/SPRINTS.md (or a given ID), get on the right sprint branch, restate scope/acceptance/plan, then implement only that ticket. Use before coding any ticket ("ticket suivant", "next ticket", "continue sprint").
---

# Skill: start-ticket — begin a ticket properly

Input: a ticket ID (e.g. `UI-001`) or "next" (pick the next unchecked one).

## 1. Env green first (RULE #1)

```bash
pnpm install
pnpm lint && pnpm typecheck && pnpm build
```

Must be all green. Fix anything red before continuing.

## 2. Find the ticket

- Read `docs/SPRINTS.md` → identify **current sprint** + the **next unchecked** `- [ ]` ticket (or the given ID).
- Read the relevant docs for scope: `docs/ARCHITECTURE.md`, `docs/DESIGN_SYSTEM.md`, `docs/DATABASE.md`, `docs/VERSIONS.md` as applies.
- Implement **only that one ticket** unless the user approves more.

## 3. Get on the sprint branch (RULE #2)

Mirae uses **one branch + one draft PR per sprint** (tickets accumulate).

```bash
git fetch origin
# If the current sprint's branch already exists, continue on it:
git switch feat/sprint-<N>-<slug>        # e.g. feat/sprint-1-ui-foundation
# Otherwise branch fresh off an up-to-date main:
git switch main && git pull --ff-only
git switch -c feat/sprint-<N>-<slug>
```

Never work directly on `main`.

## 4. Restate the ticket (imposed format)

```
Current sprint: Sprint <N> — <name>
Selected ticket: <id> <title>
Scope:
- …
Acceptance criteria:
- …
Plan:
1. …
```

## 5. Implement in small verified increments

Keep `pnpm lint && pnpm typecheck && pnpm build` green as you go. Pin **exact** versions from `docs/VERSIONS.md` for any new dependency (no `^`, no `latest`); if a needed package isn't listed there, resolve one exact compatible version and record it in `docs/VERSIONS.md`.

When done → run the **preview** skill, get visual approval, then the **ship-it** skill.

## Gotchas

- One ticket at a time. Don't silently change architecture (locked decisions live in `docs/DECISIONS.md`).
- UI tickets must clear the quality bar in `docs/DESIGN_SYSTEM.md` (white/black/zinc + pastel blue, one border, no shadcn look).
