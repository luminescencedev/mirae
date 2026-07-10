---
name: ship-it
description: Ship a Mirae ticket once the preview is approved — format, get all checks green, verify pinned versions, tick the ticket in docs/SPRINTS.md, make a focused commit, push the sprint branch, and open/update a DRAFT PR to main. Never merges. Use only after the user approves the preview ("ship it", "push", "validé").
---

# Skill: ship-it — commit, push, open/update a draft PR

**Preconditions:** the user approved the preview, and this is their explicit go-ahead. If they haven't approved, run **preview** first — do not ship on your own initiative.

## 1. Format + all checks green

```bash
pnpm format
pnpm lint && pnpm typecheck && pnpm build && pnpm format:check
```

Fix until green.

## 2. Verify pinned versions

```bash
pnpm ls --depth 0 -r
```

Confirm installed versions match `docs/VERSIONS.md`. Flag any mismatch — don't ship silently over it.

## 3. Update docs

- Tick the ticket in `docs/SPRINTS.md` (`- [ ]` → `- [x]`).
- If a decision or architecture changed, record it in `docs/DECISIONS.md` (and the relevant `docs/*`), not just in code.

## 4. Focused commit

Conventional Commits, scoped, one focused commit per ticket. End the message with the Co-Authored-By trailer for Claude.

```bash
git add -A
git commit -m "feat(web): <ticket> <short desc>"
```

Scopes: `web` · `api` · `db` · `packages` · `repo`/`chore` · `docs`.

## 5. Push the sprint branch

```bash
git push -u origin feat/sprint-<N>-<slug>
```

## 6. Open or update the DRAFT PR (one per sprint)

```bash
# First ticket of the sprint — create it as a draft:
gh pr create --draft --base main --head feat/sprint-<N>-<slug> \
  --title "Sprint <N> — <name>" --body "<summary of tickets so far>"

# Later tickets — the push already updates the PR; refresh the body if useful:
gh pr edit <pr> --body "<updated summary>"
```

## 7. Never merge

`main` is the user's to merge. **Do not merge PRs.** Do not push directly to `main`. Report the PR URL and stop.

## Reminders

- No push without the user's approval. One focused commit per ticket. Draft PR, one per sprint.
- Never reintroduce Express / React Router / a second Worker (locked — `docs/DECISIONS.md`).
