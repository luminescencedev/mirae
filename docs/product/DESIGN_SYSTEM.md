# Design System

> Canonical source for visual direction, tokens, components, and UI rules. For
> brand attributes, personality, voice, and the identity constraints, see
> [`BRAND.md`](BRAND.md).

## Direction

```txt
Pure white / black / cool zinc.
Pastel blue as main accent.
Light UI by default.
Clean dashboard screen with one rounded border.
```

Hard nos:

```txt
No beige / cream backgrounds.
No generic dark admin UI.
No raw/unstyled shadcn look shipped as-is.
```

The first public version must feel like a **premium client/workflow OS for artists**, not an enterprise SaaS template. Every screen should look good enough to be a product marketing screenshot.

## Foundations (2026-07-10 — see docs/decisions/DECISIONS.md)

- **Component base:** shadcn/ui architecture (Radix + `cva` + `cn`) restyled onto Mirae tokens. Not copied blocks; `Button` mirrors shadcn's variants/sizes/`asChild`.
- **Bar:** clean light SaaS at shadcn/Linear polish — thin borders, small radii, calm whitespace, pastel tag chips, status dots. Reference boards: Taskk, widelab, logip, Shopeers.
- **Double-bezel:** optional only (`<Card bezel>`), for a rare hero surface — not the default.
- **Theme:** light only for now; dark tokens are dormant in `globals.css` (re-addable without touching components).
- **Typography:** Inter, self-hosted (`apps/web/src/assets/fonts`, 400/500/600), `--font-sans`.
- **Icons:** Hugeicons **Stroke Rounded** (house family) via `@mirae/ui` `Icon` (20 / 1.7; 16 / 1.8 in buttons). `react-icons` for brand logos only. Bespoke `BranchReturnIcon` / `EnterKeyIcon` as accents.
- **Motion (emil-design-eng / apple-design):** strong custom easing tokens (`--ease-out`, `--ease-spring`), scale-on-press, spring `HoverBarList` (one bar slides behind the hovered row — horizontal tabs + vertical lists, no default selection). Respects `prefers-reduced-motion`.
- **Tokens:** pastel-blue `accent-50..950`; semantic `canvas` / `surface` / `surface-muted` / `surface-sunken` / `border` / `border-strong` / `fg` / `fg-muted` / `fg-subtle`; radii `sm..3xl`; `shadow-soft` / `shadow-panel` / `shadow-bezel`.

## Palette

| Token       | Role                                                          |
| ----------- | ------------------------------------------------------------- |
| white       | primary surface                                               |
| black       | primary text, primary CTA                                     |
| zinc scale  | borders, secondary text, subtle fills                         |
| pastel blue | main accent, focus, active state, subtle glow behind previews |

No beige/cream. Accent used tastefully, not everywhere.

## Landing style (Atlasflow-like)

- Pure white background, minimal header, short hero headline.
- Black primary CTA, white secondary CTA.
- Large product preview inside **one** clean rounded dashboard container with a single subtle border.
- Optional subtle pastel-blue glow behind the preview. No decorative clutter.

Hero copy:

```txt
Your private commission studio.

Mirae helps digital artists manage requests, quotes, queues, revisions and deliveries in one calm workspace.
```

CTAs: `Open your studio` · `View demo` · `Join the early list`

## App style

Light UI, pure white surfaces, zinc/neutral grays, black text, pastel blue accent. Rounded app shell, **one** clear sidebar (rail + sidebar only if a mockup explicitly shows it, and only when intentional/visually clear). Large rounded containers, thin borders, soft shadows only when needed, calm typography. No overloaded KPI dashboards.

## Component philosophy

```txt
Radix behavior + Mirae visuals.
```

Use: `cva` for variants · `cn` for class merging · Tailwind tokens for consistency · Hugeicons for icons · Radix for accessible primitives.

Avoid: shadcn visual defaults · random block copy-paste · large component libraries · scattered one-off inline styles.

```txt
Radix UI primitives      -> yes
shadcn-style architecture -> yes
shadcn prebuilt blocks   -> no
random copied UI blocks  -> no
custom Mirae components   -> yes
```

## Component build order

Base primitives:

```txt
Button Input Textarea Select Badge StatusPill Card Panel Tabs Dialog
Dropdown Tooltip AppShell Sidebar PageHeader EmptyState Skeleton Toast
```

Mirae-specific business components:

```txt
CommissionCard CommissionStatusPill ClientBadge PriceTag DeadlinePill
RevisionCounter ReferenceStrip QueueList RequestListItem ActivityItem
QuoteLineItem DeliveryCard StudioStatusBadge
```

## Priority screens

```txt
1. Landing hero + app preview     6. Public artist page
2. App shell / overview           7. Public request form
3. Requests inbox                 8. Client portal
4. Queue view                     9. Quote builder
5. Commission detail panel       10. Delivery page
```

Most important: **Requests/Queue list + detail panel** — where Mirae becomes a real product.

## Quality bar (check before marking any UI ticket done)

```txt
Pure white/black/zinc, not beige?
Pastel blue accent used tastefully?
Only one clean border around dashboard mockups?
Sidebar intentional, not accidentally duplicated?
Feels like a premium product shot?
Spacing consistent?
Empty states calm and useful?
Avoids generic admin dashboard vibes?
```

## Mockup ingestion

Priority: **User Figma/mockup > this doc > generic assumptions > library defaults.**

When mockups are provided: identify the screen, extract layout/spacing/colors/components/states, ask only if ambiguity blocks work, implement the closest faithful version, preserve the Mirae system, do not overgeneralize one mockup to every screen. If a mockup conflicts with code, preserve behavior but update UI to match the mockup.

## Pinned front-end library versions

Tokens/tooling this system is built on (see `docs/decisions/DECISIONS.md` for full pin list): `tailwindcss 4.3.2`, `motion 12.42.2`, `@hugeicons/react 1.1.9`, `class-variance-authority 0.7.1`, `tailwind-merge 3.6.0`, `clsx 2.1.1`, Radix primitives (dialog 1.1.19, dropdown-menu 2.1.20, popover 1.1.19, tooltip 1.2.12, tabs 1.1.17, select 2.3.3, switch 1.3.3, checkbox 1.3.7, toast 1.2.19).

## Public & mobile principles (post-MVP direction)

> Additive to the existing tokens/components above — these guide the next cycle's public studio + mobile work. Specs: [`PUBLIC_STUDIO_SPEC.md`](PUBLIC_STUDIO_SPEC.md), [`MOBILE_PRODUCT_SPEC.md`](MOBILE_PRODUCT_SPEC.md).

### Public pages are portfolio-first

- Artwork dominates the layout; artist identity is immediate but not visually dominant.
- Commission availability (open/waitlist/closed) is understandable in seconds, via text + status — never color alone.
- Links are **curated artist cards** (simple / card / media / featured), not a stack of identical buttons; only one or two featured at a time.
- The request flow feels like part of the studio, not a bolted-on form.
- Responsive images, lazy loading, placeholders and no layout shift are part of visual quality — a slow or janky page is a broken page.

### Mobile is a first-class design target

- Design from mobile constraints first, not by compressing desktop.
- Private app uses **bottom navigation** for frequent destinations (Overview / Requests / Queue / Studio / More); respect safe-area insets.
- Detail flows (commission, request) are **full-screen pages or sheets** with a sticky action bar — never a desktop side panel squeezed into the viewport.
- No hover-only actions; every gesture (drag, swipe) has a visible button alternative; comfortable touch targets; clear pressed states.
- Keyboard must never cover the active field or primary action.

### Customization is curated, not a page builder

- Artists pick from **presets** (accent, typography, hero/portfolio layout, image radius, section order/visibility) — not arbitrary CSS, fonts, scripts, or raw HTML.
- Every appearance combination must stay accessible (contrast validated server-side); invalid combinations are impossible by construction.
