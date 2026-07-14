# Beta metrics (BETA-008, BETA-009)

What we measure during the closed beta and how to read it from data we already
collect. Keep it lightweight — with 5–10 artists, per-artist qualitative signal
matters more than aggregate rates, but define them so we're consistent.

## Activation (BETA-008)

**Definition — an artist is "activated" when their studio is genuinely usable by
a client**, i.e. all of:

- Profile has a photo **and** bio
- ≥ 1 commission type created
- ≥ 1 published portfolio project
- Status = **open for commissions**

(This is exactly the onboarding checklist in `OnboardingDock` — reuse it as the
activation definition so product + metric agree.)

**How to read it:** per artist, from `GET /api/artists/me` + commission types +
portfolio + links (the dock already computes `doneCount/total`). Activated =
checklist complete.

**Targets (directional, not pass/fail):**
- Setup completion: aim for most invited artists to reach activated within their
  first session (~30 min).
- Time-to-activate: note it per artist (from signup → checklist complete).

## Portfolio → request conversion (BETA-009)

**Definition:** of the people who view a studio's public page, how many submit a
request.

**Source (already built):** the privacy-friendly `studio_events` table +
`GET /api/analytics` already returns `views`, `uniqueViews`, `requestSubmits`
and a computed `conversion` (`requestSubmits / views`), plus `requestStarts`
(form opened) and `byDay` / `topReferrers`.

**Funnel to watch per artist:**

```
view  →  request_start  →  request_submit
```

- **View → start**: does the page make people want to request? (Portfolio-first
  hierarchy, clear "request" affordance.)
- **Start → submit**: is the request form itself losing people? (Length,
  friction, required fields.)

Read both drop-offs — a low overall conversion means different fixes depending
on which step leaks.

## What to capture per artist (beta scorecard)

| Field | Source |
| --- | --- |
| Activated? (y/n) + time-to-activate | onboarding checklist |
| Views / unique | analytics |
| view→start / start→submit | analytics events |
| Requests received | requests inbox |
| Ran a real commission end-to-end? | observation |
| Would-use / would-pay signal | interview |
| Top friction points | interview + feedback widget |

## Caveats

- Tiny N — treat numbers as anecdotes with structure, not statistics.
- Don't optimize conversion at the expense of the qualitative "would you
  actually use this" signal, which is the real beta question.
