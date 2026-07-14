# Beta issue triage (BETA-010)

How we log, classify and prioritize everything that surfaces during the beta
(interviews, the in-app feedback widget, direct messages, our own observation).

## Sources

- In-app **feedback widget** (`beta_feedback` table: sentiment good/idea/bug + note + page)
- **Interviews** (see `INTERVIEW_SCRIPT.md`)
- Observation notes during setup / workflow runs
- Direct messages from testers

## Classify each issue

**Type:** `bug` · `confusion` (UX/copy, works-but-unclear) · `missing` (feature gap) · `idea`

**Severity**

| Sev | Meaning |
| --- | --- |
| S1 | Blocks the core loop (can't set up, can't receive/handle a request, can't deliver) or data loss / security |
| S2 | Major friction, has a workaround; or a feature testers repeatedly expect |
| S3 | Minor UX/polish/copy |

**Frequency:** how many distinct testers hit it (1, 2, 3+). Frequency ✕ severity
drives priority — an S2 hit by 4 testers outranks an S1 hit by 1 in a corner case.

## Priority

`P0` fix now (S1, or S2 hit by many) · `P1` this beta-fix sprint · `P2` backlog / post-beta.

## Log format (one row per issue)

```
| id | date | source | type | sev | testers | title | where (screen/step) | notes / quote | priority | status |
```

- **where** = the exact screen/step (e.g. "studio → commission types → image upload"); pull the `page` field from the feedback widget when present.
- **status** = `new` → `triaged` → `in-progress` → `fixed` → `verified`.
- Keep the tester's **verbatim quote** — it's the best fix brief.

## Weekly rollup

- Count by severity + type.
- Top P0/P1 list → feeds the prioritized beta-fix sprint (BETA-011).
- Note anything **repeated across testers** — that's the signal, not one-offs.

## Feeding BETA-011

The beta-fix sprint takes the ranked P0/P1 list, groups by area, and burns it
down before adding new features. Re-verify each with the tester who reported it
where possible.
