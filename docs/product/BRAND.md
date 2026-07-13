# Brand

> Canonical source for Mirae's brand attributes, personality, and voice — and
> the constraints the visual identity must satisfy. This doc is locked in
> Sprint 11 (BRAND-001) and is the reference every later identity ticket
> (symbol, wordmark, motion, OG, email) builds from. Visual tokens and
> components live in [`DESIGN_SYSTEM.md`](DESIGN_SYSTEM.md); product decisions in
> [`../decisions/DECISIONS.md`](../decisions/DECISIONS.md).

## Essence

**Mirae is the calm, private studio where an artist's own audience becomes structured work.**

Not a marketplace, not a social feed, not an AI tool. A quiet, premium workspace that makes a working artist look and feel professional — from the public studio page a client first lands on, through intake, quoting, queue, revisions and delivery.

## Name

**Mirae** — 미래 / 未来, "future." A short, soft, forward-looking word. Pronounced _mee-rae_. Always title-case "Mirae"; never all-caps, never "MiRae" or "mirae" in prose. The name carries the promise: a calmer future for the way independent artists run commissions.

## Brand attributes

Five locked attributes. Every identity, copy and UI decision should be defensible against these.

1. **Calm** — spacious, quiet, unhurried. The product reduces the anxiety of running commissions. Never loud, never urgent-by-default, never cluttered.
2. **Precise** — thin borders, exact spacing, clear status. Craft signals trust. Nothing sloppy or approximate ships.
3. **Private** — a personal studio, not a public arena. No vanity metrics, no follower counts, no discovery. The artist owns their space and their audience.
4. **Premium** — every screen could be a product marketing screenshot. Restraint reads as quality; decoration reads as cheap.
5. **Artist-first** — the artist's work and identity lead; Mirae is the quiet frame, never the star. "Powered by Mirae" is a whisper, not a banner.

## Personality

- **Archetype:** the calm professional studio — a well-run atelier, not a startup megaphone.
- **It is:** composed, confident, understated, considered, warm-but-restrained.
- **It is not:** hype-y, playful-for-its-own-sake, corporate/enterprise, "AI-powered," gamified, salesy.

If Mirae were a room: white walls, good light, one framed piece, nothing on the floor.

## Voice & tone

Plain, warm, and short. Speak to a working artist as a capable peer — never talk down, never over-explain, never oversell.

**Principles**

- Short sentences. Concrete nouns. Active voice.
- Say the thing; skip the adjectives. "Send request," not "Effortlessly send your amazing request!"
- Confident, not boastful. State what the product does; let it be enough.
- Calm under error: acknowledge, guide, don't alarm. ("The page hit an unexpected error. Try again, or reload if it keeps happening.")
- No hype vocabulary (revolutionary, unleash, supercharge, magic, effortless), no exclamation-mark defaults, no emoji in product chrome.

**Examples**

| Say                                                       | Not                                                          |
| --------------------------------------------------------- | ------------------------------------------------------------ |
| Your private commission studio.                           | The #1 all-in-one platform to supercharge your art business! |
| Tell Rain Aoki what you have in mind — no account needed. | Sign up now to unlock unlimited commission requests!         |
| Something broke on our side.                              | Oops! Something went wrong 😢                                |
| Open for commissions                                      | 🔥 SLOTS AVAILABLE NOW 🔥                                    |

## Visual principles (constraints for the identity)

These bind the symbol, wordmark, motion, favicon, OG and email work. Full tokens in [`DESIGN_SYSTEM.md`](DESIGN_SYSTEM.md).

- **Monochrome-first.** The identity must be complete in pure black and white. Color is not load-bearing.
- **Geometric, not illustrative.** A single clean geometric form. No brushes, no hand-drawn marks, no gradients-as-identity.
- **Pastel-blue as a single accent**, used sparingly (focus, active state, a subtle glow) — never a rainbow, never a gradient wash.
- **Recognizable small.** Reads at 16 px (favicon) as clearly as at hero size.
- **Quiet motion.** Motion is smooth and brief, driven by the shared easing tokens; it's controlled per component (not gated by the OS `prefers-reduced-motion` setting — see DESIGN_SYSTEM), so keep it restrained.

## Symbol brief (feeds BRAND-002+)

The Mirae symbol must:

- be a **single geometric form**;
- subtly evoke an **`M`** without becoming a generic lettermark;
- work in **black and white**;
- remain recognizable at **16 px**;
- support **transparent, light and dark** backgrounds;
- translate naturally into a **loader and motion sequence**;
- **avoid** generic brushes, palettes, sparkles, and obvious AI symbolism.

The symbol must stand alone (without the wordmark) and stay consistent across sidebar, favicon, email, public footer and OG cards.

## What the brand rejects

- Marketplace / discovery / social-network cues (feeds, follower counts, ratings, "trending").
- AI-first framing and symbolism (sparkles, orbs, neural motifs, "magic").
- Enterprise-SaaS blandness (stock gradients, generic dashboards, buzzword copy).
- Loudness: hype words, exclamation defaults, emoji in chrome, urgency manipulation.
- Anything that makes Mirae the star instead of the artist's work.

## Application surfaces

One identity everywhere: app sidebar mark, favicon + app icon, social avatar, transactional email header/footer, public studio "Powered by Mirae" footer, and Open Graph cards.

## The mark (locked — BRAND-002)

The Mirae symbol is a **solid, rounded-corner zigzag "M"** — three feet, two peaks, one diagonal descent — built as a single geometric vector. It reads as M instantly, holds at 16 px, and works reversed on dark. Canonical vector master: [`packages/ui/src/brand/mark.svg`](../../packages/ui/src/brand/mark.svg) (`currentColor`, `viewBox 0 0 150 75`).

The **wordmark** is Inter SemiBold, outlined — consistent with the product typeface. It is **provisional** (BRAND-003): a bespoke wordmark may replace it later. The symbol is locked; the wordmark is not.

## Assets & files

Source vectors live in `packages/ui/src/brand/`; rasters are generated from them by [`scripts/generate-brand-assets.mjs`](../../scripts/generate-brand-assets.mjs) (sharp) — **never edit the PNGs by hand**.

- **Vectors:** `mark.svg`, `mark-square.svg` (padded, for square icons), `wordmark.svg`, `logo-horizontal.svg`, `logo-stacked.svg`; OG templates `apps/web/public/og-default.svg` + `og-studio.svg` (text is the outlined Inter wordmark — the app typeface renders exactly, no font dependency).
- **Components (`@mirae/ui`):** `<Mark/>`, `<Logo variant="horizontal|stacked"/>`, `<Loader/>`.
- **Rasters (`apps/web/public/`):** `favicon.svg` · `favicon.ico` · `favicon-16/32.png` · `apple-touch-icon.png` (180) · `icon-192/512.png` + maskable · `avatar-social.png` (400) · `og-default.png` + `og-studio.png` (1200×630) · `email-logo@2x.png` + `-dark`. Declared in `apps/web/index.html` + `site.webmanifest`.

## Motion (BRAND-009 / loader BRAND-010)

Motion is quiet, brief, and single-gesture — never bouncy or attention-seeking. The signature motion is a **left → right fill**: the mark fills over a faint track of itself, then flows out to the right and repeats. It maps directly to the forward reading of the mark and to "future." Implemented as `<Loader/>`. (Motion is component-controlled, not gated by the OS reduced-motion setting — see DESIGN_SYSTEM.)

## Usage (BRAND-013)

- **Clearspace:** keep padding ≈ the mark's foot-height clear on all sides.
- **Minimum size:** 16 px (favicon). Below that, don't use the mark.
- **Colour:** monochrome-first — ink on light, white on dark. Accent pastel blue only as a restrained highlight, never as the mark's fill by default.
- **Don't:** recolour with gradients, add effects/shadows to the glyph, stretch or rotate, place on a busy background without enough contrast, or let the wordmark outshine an artist's own work.
- **Reference sheet:** the full system (lockups, icons, OG, loader) is shown on the brand sheet artifact produced in Sprint 11.
