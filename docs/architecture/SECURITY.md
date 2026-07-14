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

| Endpoint | Limit | MIME |
| --- | --- | --- |
| portfolio asset | 10 MB | image allowlist |
| avatar / cover | 8 MB | image allowlist |
| commission-type image | 8 MB | image allowlist |
| commission file (reference/wip/deliverable) | size recorded, **no MIME allowlist** | any |

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

| Endpoint | Gate | Headers |
| --- | --- | --- |
| `GET /api/delivery/:token/files/:id` | delivery token + commission match | `attachment` + `nosniff` |
| `GET /api/portal/:token/files/:id` | portal token + commission match + `reference` kind only | `nosniff` (references can't be svg/html — blocked at upload) |
| `GET /api/studio/:handle/{avatar,cover}` | public by design | `nosniff` |
| `GET /api/commission-types/:id/image` | public by design | `nosniff` |
| `GET portfolio asset` | public by design | `nosniff` |

All streams now send `X-Content-Type-Options: nosniff`; deliverables download as
attachments; active-content MIME is blocked at commission-file upload.

## Closed gaps

- ~~Commission file upload accepts any MIME~~ → blocked svg/html/js + 50 MB cap (TRUST-003).
- ~~Portal reference stream inline~~ → `nosniff` + upload-time MIME block (TRUST-005).

## Operational

- **Backups & recovery** — see [`OPERATIONS.md`](./OPERATIONS.md) (TRUST-019).
- **Incident response** — see [`OPERATIONS.md`](./OPERATIONS.md) (TRUST-020).
- **Legal** — `/privacy` (TRUST-012), `/terms` (TRUST-013).
