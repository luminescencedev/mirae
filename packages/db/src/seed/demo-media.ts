// Shared manifest for the demo studio's media. Imported by both the DB seed
// (seed-dev.ts) and the image generator (scripts/seed-demo-media.mjs) so the
// R2 keys + dimensions always match. Images are generated as tasteful gradient
// placeholders (see the generator) — swap for real art anytime by re-uploading
// to the same keys.

export type MediaSpec = {
  key: string;
  w: number;
  h: number;
  hue: number;
  label?: string;
  big?: boolean;
};
type Asset = { label: string; hue: number; w: number; h: number };
type Project = {
  slug: string;
  title: string;
  description: string;
  projectType: "illustration" | "character_design";
  featured: boolean;
  assets: Asset[];
};

export const DEMO_HANDLE = "rainaoki";

const base = `demo/${DEMO_HANDLE}`;
export const AVATAR = { key: `${base}/avatar.png`, w: 512, h: 512, hue: 250 };
export const DELIVERABLE = {
  key: `${base}/sticker-sheet.png`,
  w: 1200,
  h: 1200,
  hue: 160,
};

/** Portfolio projects, each with generated assets. `hue` drives the gradient. */
export const PROJECTS: Project[] = [
  {
    slug: "ashfall-key-art",
    title: "Ashfall — key art",
    description: "Cover illustration for a narrative RPG. Full render.",
    projectType: "illustration",
    featured: true,
    assets: [
      { label: "Ashfall", hue: 258, w: 1280, h: 1600 },
      { label: "Ashfall · detail", hue: 268, w: 1280, h: 1600 },
    ],
  },
  {
    slug: "character-lineup",
    title: "Character lineup",
    description: "Cast exploration for an indie title — five leads.",
    projectType: "character_design",
    featured: false,
    assets: [
      { label: "Kaida", hue: 200, w: 1080, h: 1440 },
      { label: "Rook", hue: 20, w: 1080, h: 1440 },
      { label: "Vega", hue: 320, w: 1080, h: 1440 },
    ],
  },
  {
    slug: "nocturne-cover",
    title: "Nocturne — album cover",
    description: "Square cover art for an electronic EP.",
    projectType: "illustration",
    featured: false,
    assets: [{ label: "Nocturne", hue: 285, w: 1400, h: 1400 }],
  },
  {
    slug: "twitchies-emotes",
    title: "Twitchies — emote set",
    description: "A set of six expressive emotes for a streamer.",
    projectType: "illustration",
    featured: false,
    assets: [{ label: "Twitchies", hue: 150, w: 1400, h: 1400 }],
  },
  {
    slug: "kaida-reference",
    title: "Kaida — reference sheet",
    description: "Turnaround + colour callouts for a VTuber model.",
    projectType: "character_design",
    featured: false,
    assets: [{ label: "Kaida ref", hue: 34, w: 1600, h: 1100 }],
  },
];

/** Flattened list of every generated image (for the uploader). */
export function allMedia(): MediaSpec[] {
  const items: MediaSpec[] = [AVATAR, DELIVERABLE];
  for (const p of PROJECTS) {
    p.assets.forEach((a, i) => {
      items.push({ ...a, key: `${base}/portfolio/${p.slug}-${i}.png` });
    });
  }
  return items;
}

/** The R2 key for a given project asset (must match allMedia()). */
export function assetKey(slug: string, index: number): string {
  return `${base}/portfolio/${slug}-${index}.png`;
}
