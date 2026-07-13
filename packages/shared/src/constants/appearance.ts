// Public studio appearance config. Server-validated: unknown values fall back
// to defaults via normalizeAppearance. See docs/product/PUBLIC_STUDIO_SPEC.md.

export const APPEARANCE_ACCENTS = [
  "blue",
  "lavender",
  "rose",
  "mint",
  "amber",
  "mono",
] as const;
export const APPEARANCE_TYPOGRAPHY = ["clean", "editorial", "soft"] as const;
export const APPEARANCE_HERO_LAYOUTS = ["cover", "split", "minimal"] as const;
export const APPEARANCE_PORTFOLIO_LAYOUTS = [
  "editorial",
  "grid",
  "compact",
] as const;
export const APPEARANCE_IMAGE_RADII = ["soft", "medium", "minimal"] as const;

export type AppearanceAccent = (typeof APPEARANCE_ACCENTS)[number];
export type AppearanceTypography = (typeof APPEARANCE_TYPOGRAPHY)[number];
export type AppearanceHeroLayout = (typeof APPEARANCE_HERO_LAYOUTS)[number];
export type AppearancePortfolioLayout =
  (typeof APPEARANCE_PORTFOLIO_LAYOUTS)[number];
export type AppearanceImageRadius = (typeof APPEARANCE_IMAGE_RADII)[number];

export type StudioAppearance = {
  accent: AppearanceAccent;
  typography: AppearanceTypography;
  heroLayout: AppearanceHeroLayout;
  portfolioLayout: AppearancePortfolioLayout;
  imageRadius: AppearanceImageRadius;
  showBio: boolean;
  showSocials: boolean;
  showPoweredBy: boolean;
};

export const DEFAULT_APPEARANCE: StudioAppearance = {
  accent: "blue",
  typography: "clean",
  heroLayout: "cover",
  portfolioLayout: "editorial",
  imageRadius: "soft",
  showBio: true,
  showSocials: true,
  showPoweredBy: true,
};

function pick<T extends readonly string[]>(
  allowed: T,
  value: unknown,
  fallback: T[number],
): T[number] {
  return typeof value === "string" &&
    (allowed as readonly string[]).includes(value)
    ? (value as T[number])
    : fallback;
}

function bool(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

// Coerce arbitrary input into a valid StudioAppearance (defaults for anything
// missing/invalid). Use on every read + write so the shape is always safe.
export function normalizeAppearance(input: unknown): StudioAppearance {
  const c = (input ?? {}) as Record<string, unknown>;
  const d = DEFAULT_APPEARANCE;
  return {
    accent: pick(APPEARANCE_ACCENTS, c.accent, d.accent),
    typography: pick(APPEARANCE_TYPOGRAPHY, c.typography, d.typography),
    heroLayout: pick(APPEARANCE_HERO_LAYOUTS, c.heroLayout, d.heroLayout),
    portfolioLayout: pick(
      APPEARANCE_PORTFOLIO_LAYOUTS,
      c.portfolioLayout,
      d.portfolioLayout,
    ),
    imageRadius: pick(APPEARANCE_IMAGE_RADII, c.imageRadius, d.imageRadius),
    showBio: bool(c.showBio, d.showBio),
    showSocials: bool(c.showSocials, d.showSocials),
    showPoweredBy: bool(c.showPoweredBy, d.showPoweredBy),
  };
}
