// Optional public-studio content sections (about + FAQ). Stored on the artist
// profile; validated in the app layer before persisting.

export type FaqItem = { q: string; a: string };

export const MAX_FAQ_ITEMS = 12;
export const MAX_ABOUT_LEN = 2000;
export const MAX_FAQ_Q_LEN = 200;
export const MAX_FAQ_A_LEN = 1000;

// Coerce arbitrary input into a safe FaqItem[] (drops malformed entries, trims,
// enforces limits). Use on every write.
export function normalizeFaq(input: unknown): FaqItem[] {
  if (!Array.isArray(input)) return [];
  const out: FaqItem[] = [];
  for (const raw of input) {
    if (!raw || typeof raw !== "object") continue;
    const r = raw as Record<string, unknown>;
    const q = typeof r.q === "string" ? r.q.trim().slice(0, MAX_FAQ_Q_LEN) : "";
    const a = typeof r.a === "string" ? r.a.trim().slice(0, MAX_FAQ_A_LEN) : "";
    if (!q || !a) continue;
    out.push({ q, a });
    if (out.length >= MAX_FAQ_ITEMS) break;
  }
  return out;
}

// Coerce about text to a trimmed, length-capped string or null.
export function normalizeAbout(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const v = input.trim().slice(0, MAX_ABOUT_LEN);
  return v || null;
}
