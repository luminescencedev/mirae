# Security & trust

Living security reference for Mirae. Started in Sprint 22 (trust & beta
hardening). Pairs with `DECISIONS.md` (locked architecture) and `ARCHITECTURE.md`
(endpoints). Update it whenever a surface, mitigation or audit changes.

## Surfaces

**Public, unauthenticated**

- `POST /api/waitlist` — email capture.
- `POST /api/studio/:handle/requests` — commission request intake (no account).
- `POST /api/studio/:handle/events` — privacy-friendly analytics beacons.
- `GET /@handle`, `GET /og/studio/:handle`, `/robots.txt`, `/sitemap.xml` — read-only.

**Public, token-scoped** (unguessable token = the credential)

- `/api/portal/:token/*` — client portal (read + threads, revisions, quote accept/decline, reference stream).
- `/api/delivery/:token/*` — delivery page (read + deliverable stream + acknowledgement).

**Authenticated** (Better Auth session cookie, owner-scoped via `getArtist`)

- `/api/artists/*`, `/api/portfolio/*`, `/api/commissions/*`, `/api/commission-types/*`, `/api/artist-links/*`, `/api/analytics`.

**Upload endpoints** (all authenticated + owner-scoped today)

| Endpoint                                    | Limit                                | MIME            |
| ------------------------------------------- | ------------------------------------ | --------------- |
| portfolio asset                             | 10 MB                                | image allowlist |
| avatar / cover                              | 8 MB                                 | image allowlist |
| commission-type image                       | 8 MB                                 | image allowlist |
| commission file (reference/wip/deliverable) | size recorded, **no MIME allowlist** | any             |

## Threats → mitigations (mapped to Sprint 22 tickets)

1. **Storage exhaustion / cost abuse** — an authenticated artist uploads
   unbounded data. → **TRUST-002** per-artist storage quota.
2. **Malicious file content** — SVG/HTML polyglots executing script on the app
   origin. Delivery streams already force `content-disposition: attachment`;
   the **portal reference stream serves inline** (risk). → **TRUST-003** (MIME
   allowlist on commission files) + **TRUST-005** (force attachment / `nosniff`
   on all user-content streams).
3. **Decompression / resolution bombs** — huge-dimension images. → **TRUST-003**
   max-resolution check via the header parser (`image-size.ts`).
4. **Orphaned R2 objects** — rows deleted but objects linger (cost, leakage). →
   **TRUST-004** periodic cleanup (cascade delete handles the common path).
5. **Unauthorized private-file access** — token/ownership bypass. → **TRUST-005**
   audit of every file-serving path.
6. **Rate abuse / spam / brute force** — public request form, analytics beacons,
   auth endpoints. → **TRUST-006** global rate limiting; deferred REQUESTUX
   honeypot / Turnstile / duplicate-submission land here.
7. **Token guessing** — portal/delivery tokens. Today: `crypto.randomUUID()`
   (122 bits) → adequate. → **TRUST-008** confirm + document; **TRUST-009**
   revocation for both portal and delivery tokens.
8. **Session/cookie weakness** — → **TRUST-007** Better Auth hardening audit
   (secure + httpOnly + sameSite cookies, session lifetime, trusted origins).
9. **Supply-chain / secret leakage** — → **TRUST-015** dependency scanning,
   **TRUST-016** secret scanning (CI).
10. **Data-rights gaps** — → **TRUST-010** data export, **TRUST-011** account
    deletion.
11. **No forensic trail** — → **TRUST-014** structured audit logs for security
    events (auth, deletion, token rotation/revocation).

## File-access audit (TRUST-005)

Every R2-serving endpoint was reviewed for authorization + safe headers:

| Endpoint                                 | Gate                                                    | Headers                                                      |
| ---------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------ |
| `GET /api/delivery/:token/files/:id`     | delivery token + commission match                       | `attachment` + `nosniff`                                     |
| `GET /api/portal/:token/files/:id`       | portal token + commission match + `reference` kind only | `nosniff` (references can't be svg/html — blocked at upload) |
| `GET /api/studio/:handle/{avatar,cover}` | public by design                                        | `nosniff`                                                    |
| `GET /api/commission-types/:id/image`    | public by design                                        | `nosniff`                                                    |
| `GET portfolio asset`                    | public by design                                        | `nosniff`                                                    |

All streams now send `X-Content-Type-Options: nosniff`; deliverables download as
attachments; active-content MIME is blocked at commission-file upload.

## Closed gaps

- ~~Commission file upload accepts any MIME~~ → blocked svg/html/js + 50 MB cap (TRUST-003).
- ~~Portal reference stream inline~~ → `nosniff` + upload-time MIME block (TRUST-005).

## Rate limiting (TRUST-006)

`rateLimit()` middleware (binding-optional) guards the public write surfaces
(request intake, waitlist). It uses Cloudflare's native rate-limit binding when
present and no-ops otherwise. **To activate in production**, add to
`apps/api/wrangler.toml` and redeploy:

```toml
[[unsafe.bindings]]
name = "RATE_LIMITER"
type = "ratelimit"
namespace_id = "1001"
simple = { limit = 20, period = 60 }
```

Auth endpoints are covered separately by Better Auth's own rate limiting
(TRUST-007).

## Better Auth audit (TRUST-007)

- Secret + baseURL + trustedOrigins from env (no hardcoding).
- Cookies: httpOnly, `sameSite=lax`, `secure` over HTTPS (auto-off on local http).
- Sessions: 30-day rolling, refreshed ≤ once/day.
- Passwords: 10–128 chars.
- Built-in rate limiting enabled (20 req / 60 s) on auth endpoints.
- Drizzle adapter over Neon; email+password only (no social yet).

## Token entropy (TRUST-008)

Portal + delivery tokens are generated by `newToken()` — 32 CSPRNG bytes (256
bits) base64url-encoded via `crypto.getRandomValues`. Unguessable; the token is
the sole credential for the page, so it's treated as a secret (not logged, not
indexed). Rotation/revocation: TRUST-009.

## Closed-beta access gate (Sprint 23)

Signup is gated to invited artists only. The gate is **server-enforced** — a
frontend `/beta-access` page is convenience, not the control.

- **Codes are never stored in plaintext.** Only a salted `SHA-256` hash is
  persisted (`beta_access_codes.code_hash`), salted with the `BETA_CODE_PEPPER`
  secret. The plaintext is shown once at creation (`pnpm beta:code:create`) and
  is unrecoverable. Codes are `MIRAE-XXXX-XXXX-XXXX`, ~60 bits, single-use by
  default (`max_uses`), and expirable/revocable.
- **Account creation is blocked before validation.** A signup guard runs
  _before_ the Better Auth handler (`apps/api/src/index.ts`): a POST to
  `/api/auth/sign-up/*` without a valid pending invite returns **403 and
  inserts no user/account/session/verification row** — bots can't flood the DB
  by hitting the endpoint directly.
- **Flow:** `/beta-access` → `POST /api/beta/verify` validates the code and,
  for a logged-out visitor, reserves a short-lived (30 min) server-side
  `beta_invite_sessions` row bound to an **HttpOnly, SameSite=Lax, HMAC-signed**
  cookie (signed with `BETTER_AUTH_SECRET`; holds only the row id). Signup is
  then allowed; after the account exists, `POST /api/beta/redeem` consumes the
  invite and writes `beta_members`.
- **No use is spent on mere verification.** A code's `uses` counter increments
  only at atomic redemption via a conditional `UPDATE … WHERE uses < max_uses
AND not revoked AND not expired`, which is the concurrency guard — racing
  redemptions can't overshoot `max_uses`. Redemption is idempotent for existing
  members.
- **Errors are generic.** Verify never reveals whether a code is unknown,
  expired, exhausted, or revoked — all read "invalid".
- **Private API is gated too.** `betaGate` middleware returns 403 for an
  authenticated non-member on every artist-management surface (artists,
  portfolio, commissions, requests, links, analytics, feedback). Public studio
  pages, request intake, client portals and deliveries stay open — the gate
  only touches account creation and artist tooling.
- **Reversible for launch.** `CLOSED_BETA_ENABLED="false"` disables the gate
  everywhere (signup opens to all, `betaGate` becomes a no-op). Fails **closed**
  when unset. Ops: see [`OPERATIONS.md`](./OPERATIONS.md).

## Operational

- **Backups & recovery** — see [`OPERATIONS.md`](./OPERATIONS.md) (TRUST-019).
- **Incident response** — see [`OPERATIONS.md`](./OPERATIONS.md) (TRUST-020).
- **Legal** — `/privacy` (TRUST-012), `/terms` (TRUST-013).
