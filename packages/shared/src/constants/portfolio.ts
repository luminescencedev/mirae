// Portfolio project taxonomy. Keep in sync with the Postgres enums in
// packages/db (see docs/architecture/DATA_AND_API_EXTENSION.md).
export const PROJECT_TYPES = [
  "illustration",
  "character_design",
  "vtuber",
  "emote",
  "concept_art",
  "animation",
  "other",
] as const;

export type ProjectType = (typeof PROJECT_TYPES)[number];

// Portfolio project publication state.
export const PROJECT_VISIBILITIES = ["draft", "published", "archived"] as const;

export type ProjectVisibility = (typeof PROJECT_VISIBILITIES)[number];
