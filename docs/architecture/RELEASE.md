# Release & smoke test

> Two checklists for shipping the single Cloudflare Worker: what to verify
> **before** deploying (META-011) and what to click **after** deploying
> (META-012). Deploy mechanics live in [`CONTRIBUTING.md`](CONTRIBUTING.md) and
> the root `README.md`; this doc is the go/no-go gate.

The deploy runs from the working tree, **not** from git:

```bash
pnpm build
npx wrangler deploy --config apps/api/wrangler.toml
```

## Pre-release checklist (META-011)

Run before every production deploy. All must pass.

### Code & checks

- [ ] On `main` (or the branch being released) with a clean `git status`.
- [ ] `pnpm install` clean; `pnpm ls --depth 0 -r` matches [`VERSIONS.md`](VERSIONS.md) (no `^`/`latest` drift).
- [ ] `pnpm lint` passes.
- [ ] `pnpm typecheck` passes.
- [ ] `pnpm build` passes (web `dist/` produced; Worker dry-run OK).
- [ ] `pnpm format:check` clean.

### Database

- [ ] Pending Drizzle migrations generated and reviewed (`packages/db`).
- [ ] `pnpm db:migrate` applied to the production Neon branch.
- [ ] Schema change is backward-compatible with the currently-deployed Worker (deploy migrations before code that needs them).
- [ ] Did **not** run `pnpm db:seed` against production (it wipes all users).

### Configuration & bindings

- [ ] Worker secrets present: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` (`wrangler secret list`).
- [ ] Email secrets set if notifications are expected: `RESEND_API_KEY`, `MAIL_FROM` (absent → email silently no-ops).
- [ ] `apps/api/wrangler.toml` bindings intact: `ASSETS` (→ `apps/web/dist`), R2 `FILES`, both custom domains (`usemirae.com`, `app.usemirae.com`).
- [ ] `BETTER_AUTH_URL` matches the dashboard host (`https://app.usemirae.com`).

### Sign-off

- [ ] Changelog / SPRINTS notes updated; known issues listed.
- [ ] Rollback known: previous Worker version can be re-deployed from the prior tree.

## Production smoke test (META-012)

Run **after** each deploy, against the live domains. Stop and roll back on any failure.

### Health & infrastructure

- [ ] `GET https://app.usemirae.com/health` → `{"status":"ok"}`.
- [ ] `GET https://usemirae.com/api/health` → `{"status":"ok"}`.
- [ ] `wrangler tail` shows requests and **no** `unhandled_error` JSON lines during the checks below.

### Host split (both domains resolve correctly)

- [ ] `usemirae.com` → marketing landing renders.
- [ ] `app.usemirae.com/` → redirects to `/app` (then to login if signed out).
- [ ] An app path on the apex (e.g. `usemirae.com/login`) → redirects to `app.usemirae.com/login`.
- [ ] A marketing path on the app host (e.g. `app.usemirae.com/@somehandle`) → redirects to the apex.

### Marketing & public

- [ ] Landing loads; primary CTA + pricing section visible.
- [ ] Waitlist submit → success (dupe email is a silent success).
- [ ] Public studio `usemirae.com/@rainaoki` → profile + commission types render.
- [ ] Public request form `/@rainaoki/request` → submit creates a request (no account needed).
- [ ] Social-bot fetch of `/@rainaoki` (e.g. `curl -A discordbot`) → server-rendered OG HTML.

### Auth & dashboard

- [ ] Sign up a throwaway account → lands in onboarding; create studio → dashboard.
- [ ] Sign in / sign out works; no "Invalid origin" 403 on the app host.
- [ ] Overview stats render; Requests, Queue, Clients, Deliveries, Studio page all load.
- [ ] New request from the public form appears in the Requests inbox; convert to a commission.

### Files, portal & delivery (R2)

- [ ] Upload a file to a commission → succeeds; download it back.
- [ ] Generate a portal link → `usemirae.com/portal/:token` loads; leave feedback.
- [ ] Deliver → `usemirae.com/delivery/:token` loads; file downloads from R2.
- [ ] Delete an uploaded file → removed from R2 (no orphan).

### Error handling

- [ ] Client crash path reports to `POST /api/client-errors` (a `client_error` line in `wrangler tail`).
- [ ] Unhandled server throw returns a generic `500 {"error":…}` and logs `unhandled_error` (no stack leaked to the client).
