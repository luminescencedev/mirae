# AI Documentation Workflow

How Claude Code should work on Mirae. Complements the operating rules in the root `CLAUDE.md` (which stays the central index).

## For every feature / ticket

1. Read the product direction — `../vision/POST_MVP_VISION.md`.
2. Read the design principles — `../product/DESIGN_SYSTEM.md` (public + mobile + customization).
3. Read the roadmap / current sprint — `../roadmap/SPRINTS.md` (+ `../roadmap/POST_MVP_ROADMAP.md`).
4. Read the relevant feature spec — `../product/PUBLIC_STUDIO_SPEC.md`, `../product/MOBILE_PRODUCT_SPEC.md`, or `../architecture/DATA_AND_API_EXTENSION.md`.
5. Implement only that ticket; keep checks green.
6. If behavior changed, update README, `CLAUDE.md`, the roadmap, and the relevant docs — in the same change.

## Non-negotiables

- Documentation is the source of truth. Never overwrite completed history; preserve decisions/ADRs.
- Never mark a planned feature, table, or endpoint as shipped.
- Never silently change locked architecture — record changes in `../decisions/DECISIONS.md`.
- One source of truth per topic: link between docs, don't duplicate.
