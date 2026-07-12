---
name: status
description: Summarize where Mirae stands — current sprint, done tickets, next ticket, open PR/CI state, recent commits, and blockers — in a short human-friendly readout. Use when the user says "status", resumes the project, or asks "where are we".
---

# Skill: status — "where are we on Mirae?"

Trigger at the start of a session or on demand. Keep it short — the reader should get it in 15 seconds.

## 1. Sprint state (source of truth)

Read `docs/roadmap/SPRINTS.md`:

- **Current sprint** (the `## Current sprint` line).
- Done tickets (`- [x]`) vs remaining (`- [ ]`) in that sprint.
- The **next unchecked ticket** = what to pick up next.

## 2. Repo activity

```bash
git fetch origin >/dev/null 2>&1
git log --oneline -8
gh pr list --state open --json number,title,url,isDraft
gh pr checks <n> 2>/dev/null    # CI state for the open sprint PR, if any
```

## 3. Blockers

Anything red: failing checks, an open draft PR waiting for the user to review/merge, an unresolved decision, a missing env var / Neon branch. Call these out first.

## 4. Report (short, plain words)

```
📦 Mirae — status

Sprint: <N> — <name>  (<x>/<total> tickets done)
✅ Done: <ids>
👉 Next: <id> <title>
🔀 PR:   #<n> "<title>" (draft) — <CI state> — yours to merge
🛠️ main: <k> commits, checks green
⛔ Blockers: <none | …>

Run: pnpm dev  → web :5173 / api :8787/health
```

Plain language ("the app shell is done", not endpoint jargon). One line per important thing. If nothing changed since last time, say so.
