# Design System

> Canonical source for visual direction, tokens, components, and UI rules.

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
No heavy double bezel.
No generic dark admin UI.
No shadcn default look.
```

The first public version must feel like a **premium client/workflow OS for artists**, not an enterprise SaaS template. Every screen should look good enough to be a product marketing screenshot.

## Palette

| Token | Role |
|---|---|
| white | primary surface |
| black | primary text, primary CTA |
| zinc scale | borders, secondary text, subtle fills |
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

Use: `cva` for variants · `cn` for class merging · Tailwind tokens for consistency · Lucide for icons · Radix for accessible primitives.

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

Tokens/tooling this system is built on (see `docs/DECISIONS.md` for full pin list): `tailwindcss 4.3.2`, `motion 12.42.2`, `lucide-react 1.23.0`, `class-variance-authority 0.7.1`, `tailwind-merge 3.6.0`, `clsx 2.1.1`, Radix primitives (dialog 1.1.19, dropdown-menu 2.1.20, popover 1.1.19, tooltip 1.2.12, tabs 1.1.17, select 2.3.3, switch 1.3.3, checkbox 1.3.7, toast 1.2.19).
