# Mirae — Roadmap (post-MVP)

The MVP (Sprints 0–9) is live on Cloudflare. This tracks what comes next.
Positioning stays fixed: **Calendly, not VGen** — manage the relationship after
artist and client already agreed. No marketplace / discovery / matching.

## Sprint 10 — Audit & polish (in progress)

Harden the MVP before adding features. Kill every dead button, wire every
screen to the signed-in artist's real data, drop leftover mocks. Tickets live
in `docs/SPRINTS.md` (AUDIT-001…008).

Known gaps found in the audit (2026-07-11):

- Overview screen is still seed mock (Rain Aoki), not the logged-in studio
- `/app` doesn't gate on profile existence (no onboarding redirect)
- Sidebar search + notification bell are no-ops
- Clients and Deliveries nav pages are ComingSoon placeholders
- Queue "Calendar" tab is a placeholder
- Marketing DashboardPreview is a stale mock
- Portal client feedback is local-only (not persisted)

## V2 — candidate features (prioritised, not scheduled)

Ordered by value. Revisit / re-sequence as we learn from beta.

### Core (highest value)

1. **Stripe payments** — deposits, payment links, invoices (currently manual
   `paidCents`). Biggest differentiator; MVP is manual on purpose.
2. **WIP / revisions workflow** — artist uploads work-in-progress, client
   approves or requests changes, revision rounds tracked against the commission.
3. **Availability (the Calendly angle)** — queue capacity, auto open/close +
   waitlist, per-commission ETA shown to clients.

### Client relationship

4. **Portal v2** — persisted feedback, comment thread, milestone approvals.
5. **Notifications & reminders** — deadline-approaching, deposit-due, weekly
   digest; polished templates (builds on Resend from Sprint 9).

### Studio tools

6. **Analytics** — earnings, throughput, backlog, per-type stats.
7. **Templates** — quote presets, canned replies, per-commission terms/contract.
8. **Public page customization** — cover image, portfolio/gallery, theme.

### Comfort / polish

9. Command palette (⌘K, cmdk) · onboarding + first-run tour · deadlines
   calendar · Studio-page live preview · PWA / mobile pass.

### Explicitly out of scope

Discovery, marketplace, client-matching, AI-first features, escrow, taking a cut
of commission revenue (subscription-only).
