// Artist link taxonomy. Keep in sync with the Postgres enums in packages/db
// (see docs/product/PUBLIC_STUDIO_SPEC.md §5).

// What a link is for (drives grouping + default styling).
export const LINK_TYPES = [
  "social",
  "shop",
  "support",
  "video",
  "stream",
  "newsletter",
  "contact",
  "custom",
] as const;

export type LinkType = (typeof LINK_TYPES)[number];

// How a link renders on the public studio.
export const LINK_STYLES = ["simple", "card", "media", "featured"] as const;

export type LinkStyle = (typeof LINK_STYLES)[number];

// Known platforms (for icon mapping + URL normalization). `custom` covers the
// rest; this list is not exhaustive and platforms may be added freely.
export const LINK_PLATFORMS = [
  "instagram",
  "x",
  "bluesky",
  "tiktok",
  "twitch",
  "youtube",
  "discord",
  "patreon",
  "kofi",
  "artstation",
  "website",
  "email",
  "custom",
] as const;

export type LinkPlatform = (typeof LINK_PLATFORMS)[number];
