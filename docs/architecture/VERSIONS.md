# Pinned Versions

> Authoritative dependency reference for Mirae. Checked against registry.npmjs.org on **2026-07-09**.
> Pin **exact** versions (no `^`, no `latest`) in every workspace `package.json`. Do not silently substitute newer majors that appear during install unless a line says "use latest".
> Rationale for the notable pins lives in `docs/decisions/DECISIONS.md`.

## Runtime

| Tool    | Version | Notes                                                                                                                                                    |
| ------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Node.js | 24.x    | Active LTS (Jul 2026). NOT 26.x (Current until Oct 2026), NOT 22.x (Maintenance LTS). `engines.node = ">=24"`. Let nvm/fnm/Volta grab latest 24.x patch. |
| pnpm    | 11.10.0 | Package manager.                                                                                                                                         |

## Language / tooling

| Package    | Version | Notes                                                                                                                                                                                                |
| ---------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| typescript | 6.0.3   | NOT the `latest` tag (resolves to 7.0.x). TS7 GA'd 2026-07-08; Go-native compiler is stable but ecosystem tooling (some ESLint/TS plugins, ts-morph tools) hasn't caught up. Revisit in a few weeks. |
| eslint     | 10.6.0  |                                                                                                                                                                                                      |
| prettier   | 3.9.4   |                                                                                                                                                                                                      |

ESLint/Prettier ecosystem (resolved during REPO-005, exact-pinned in `@mirae/config`):

| Package                     | Version | Notes                                                       |
| --------------------------- | ------- | ----------------------------------------------------------- |
| typescript-eslint           | 8.63.0  | peer `eslint ^8.57 \|\| ^9 \|\| ^10` — ESLint 10 supported. |
| @eslint/js                  | 10.0.1  | Versioned independently from eslint (no 10.6.0 exists).     |
| eslint-plugin-react-hooks   | 7.1.1   |                                                             |
| eslint-plugin-react-refresh | 0.5.3   |                                                             |
| eslint-config-prettier      | 10.1.8  |                                                             |
| globals                     | 17.7.0  |                                                             |
| @tailwindcss/vite           | 4.3.2   | Tailwind v4 Vite plugin (matches tailwindcss).              |

## Monorepo

| Package | Version |
| ------- | ------- |
| turbo   | 2.10.4  |

## Frontend (`apps/web`)

| Package                  | Version  | Notes                                                               |
| ------------------------ | -------- | ------------------------------------------------------------------- |
| vite                     | 8.1.3    | Rolldown-based; needs Node 20.19+/22.12+ (Node 24 OK).              |
| @vitejs/plugin-react     | 6.0.3    | React plugin for Vite 8 (peer `vite ^8`). Resolved during REPO-002. |
| react                    | 19.2.7   |                                                                     |
| react-dom                | 19.2.7   |                                                                     |
| @types/react             | 19.2.17  | dev dependency. Resolved during REPO-002.                           |
| @types/react-dom         | 19.2.3   | dev dependency. Resolved during REPO-002.                           |
| @tanstack/react-router   | 1.170.17 |                                                                     |
| @tanstack/router-plugin  | 1.168.19 | Vite plugin for TanStack Router codegen.                            |
| @tanstack/react-query    | 5.101.2  |                                                                     |
| @tanstack/react-table    | 8.21.3   |                                                                     |
| tailwindcss              | 4.3.2    |                                                                     |
| motion                   | 12.42.2  | Springs/gestures (HoverBarList). Installed in @mirae/ui.            |
| sonner                   | 2.0.7    | Toasts (bottom-left). Wrapped by @mirae/ui ToastProvider/useToast.  |
| lenis                    | 1.3.25   | Smooth scroll (window). Overlays opt out via `data-lenis-prevent`.  |
| react-hook-form          | 7.81.0   |                                                                     |
| zod                      | 4.4.3    | Zod v4 — write validators against v4 docs, NOT v3 patterns.         |
| class-variance-authority | 0.7.1    |                                                                     |
| tailwind-merge           | 3.6.0    |                                                                     |
| clsx                     | 2.1.1    |                                                                     |
| date-fns                 | 4.4.0    |                                                                     |

Icons + UI (resolved during Sprint 1, UI-003):

| Package                    | Version | Notes                                                    |
| -------------------------- | ------- | -------------------------------------------------------- |
| @hugeicons/react           | 1.1.9   | Icon renderer (`Icon` wrapper in @mirae/ui).             |
| @hugeicons/core-free-icons | 4.2.2   | Icon data (tree-shakable, imported per-icon in the app). |
| react-icons                | 5.7.0   | Brand logos only (Discord/X/…) via `react-icons/si`.     |
| @radix-ui/react-slot       | 1.3.0   | shadcn Button `asChild`.                                 |

**Icon policy:** Hugeicons **Stroke Rounded** is the single house family (default 20px / stroke 1.7; 16 / 1.8 in buttons). Do NOT mix with Lucide in common screens — `lucide-react` was dropped in favour of Hugeicons for a more distinctive, less "generic dashboard" identity. Use `react-icons` only for platform logos absent from Hugeicons.

Radix UI primitives (pin each individually, same release wave):

| Package                       | Version |
| ----------------------------- | ------- |
| @radix-ui/react-dialog        | 1.1.19  |
| @radix-ui/react-dropdown-menu | 2.1.20  |
| @radix-ui/react-popover       | 1.1.19  |
| @radix-ui/react-tooltip       | 1.2.12  |
| @radix-ui/react-tabs          | 1.1.17  |
| @radix-ui/react-select        | 2.3.3   |
| @radix-ui/react-switch        | 1.3.3   |
| @radix-ui/react-checkbox      | 1.3.7   |
| @radix-ui/react-toast         | 1.2.19  |
| @radix-ui/react-accordion     | 1.2.16  |
| @radix-ui/react-alert-dialog  | 1.1.19  |
| @radix-ui/react-avatar        | 1.2.2   |
| @radix-ui/react-progress      | 1.1.12  |
| @radix-ui/react-separator     | 1.1.11  |

## Backend / API (`apps/api` — the Cloudflare Worker)

| Package             | Version | Notes                                                                                                                                                                   |
| ------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| hono                | 4.12.28 |                                                                                                                                                                         |
| @hono/zod-validator | 0.8.0   |                                                                                                                                                                         |
| workers-og          | 0.0.27  | Satori + resvg-wasm OG-image rendering in the Worker (branded social cards). Bundles ~1MB wasm; fetches fonts from Google Fonts once per colo (cached). No paid add-on. |

## Database

| Package                  | Version | Notes                                                                                           |
| ------------------------ | ------- | ----------------------------------------------------------------------------------------------- |
| drizzle-orm              | 0.45.2  |                                                                                                 |
| drizzle-kit              | 0.31.10 | dev dependency — migrations/studio                                                              |
| @neondatabase/serverless | 1.1.0   | HTTP/WebSocket driver. Required for Workers. Do NOT swap for `pg`/`postgres.js` (need raw TCP). |

## Auth

| Package     | Version |
| ----------- | ------- |
| better-auth | 1.6.23  | Wired into apps/api (Hono) + apps/web client (Sprint 3). |
| @types/node | 24.13.3 | dev dep in @mirae/db for the Node scripts (seed/check).  |

## Payments / email

| Package | Version |
| ------- | ------- |
| stripe  | 22.3.0  |
| resend  | 6.17.2  |

## Cloudflare tooling

| Package                   | Version      | Notes                                                       |
| ------------------------- | ------------ | ----------------------------------------------------------- |
| wrangler                  | 4.107.1      |                                                             |
| @cloudflare/workers-types | 5.20260708.1 | dev dependency — TS types for Worker bindings.              |
| vitest                    | 3.2.4        | dev dependency — unit tests for pure API logic (TRUST-017). |

## Dev-runtime choice

- **Adopted:** two-process dev (`vite dev` + `wrangler dev`) orchestrated by `turbo run dev` — no extra dependency (`concurrently` was dropped as redundant; Turborepo runs both persistent tasks). See `docs/decisions/DECISIONS.md`.
- **Deferred:** `@cloudflare/vite-plugin` **1.43.1** — single `vite dev` running workerd for full prod parity. Considered, not adopted. If adopted later, update `docs/architecture/CONTRIBUTING.md` + `docs/architecture/ARCHITECTURE.md` and record in `docs/decisions/DECISIONS.md`.

## Verification

After `pnpm install`, run:

```bash
pnpm ls --depth 0 -r
```

Confirm installed versions match this file. **Flag any mismatch instead of silently continuing** (per init instruction #5).
