---
name: finish-sprint
description: Close a Mirae sprint cleanly — confirm every ticket meets acceptance, verify the end-to-end flow for the sprint scope, record completion notes + known issues + the next sprint in docs/SPRINTS.md, and refresh the sprint's draft PR. Use when the last ticket of a sprint is done.
---

# Skill: finish-sprint — wrap a sprint

Run when the sprint's last `- [ ]` becomes `- [x]`.

## 1. Every ticket meets acceptance

Re-read the sprint's acceptance criteria in `docs/SPRINTS.md`. Each ticket done, checks green:

```bash
pnpm lint && pnpm typecheck && pnpm build && pnpm format:check
```

## 2. End-to-end for the sprint scope

Actually exercise the flow this sprint delivered (run the app, hit the routes/endpoints), don't just trust unit checks. Note what you verified and how.

## 3. Update docs/SPRINTS.md

- Mark the sprint heading complete (e.g. `## Sprint <N> — <name> ✅ complete`).
- Advance `## Current sprint` to the next sprint.
- Add a dated **Completion notes** block: what was verified end-to-end, any deviations recorded in `docs/DECISIONS.md`, extra version pins added to `docs/VERSIONS.md`, **known issues / follow-ups**, and the **next sprint + first ticket**.

## 4. Refresh the draft PR

```bash
gh pr edit <n> --title "Sprint <N> — <name>" --body "<all tickets + verified + decisions + follow-ups>"
```

Keep it **draft**. Do not merge — the user reviews and merges, then the next sprint branches off the updated `main`.

## 5. Report

State the sprint is complete, the acceptance is met, the PR is ready for review, and name the next sprint's first ticket.

## Reminder

Definition of sprint done (`docs/CONTRIBUTING.md`): all tickets meet acceptance · end-to-end flow works · SPRINTS.md updated · known issues listed · next sprint identified.
