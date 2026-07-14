// Branded Open Graph social cards, composited in the Worker with workers-og
// (Satori → SVG → resvg → PNG). 1200×630. Zero paid add-on: fonts are fetched
// from Google Fonts once per colo and cached; the PNG is served with a long
// immutable cache and the meta URL is versioned (?v=updatedAt) so it busts on
// profile changes.
//
// Design: light, studio-branded. Left column carries the studio name, URL, bio
// and an "Open for commissions" status chip, with a "Powered by Mirae" mark; the
// right shows the studio logo (artist avatar) in a rounded-square frame —
// consistent with the product's light UI.

import { ImageResponse, loadGoogleFont } from "workers-og";
import type { StudioMeta } from "./og.ts";

// Font buffers are expensive to fetch — memoise per isolate.
type SatoriFont = {
  name: string;
  data: ArrayBuffer;
  weight: number;
  style: "normal";
};
let fontsPromise: Promise<SatoriFont[]> | null = null;
function cardFonts(): Promise<SatoriFont[]> {
  if (!fontsPromise) {
    // Load each weight independently and tolerate a single failure — a missing
    // weight shouldn't sink the whole card. If both fail, workers-og falls back
    // to its bundled default font.
    const load = (weight: number) =>
      loadGoogleFont({ family: "Inter", weight })
        .then((data): SatoriFont | null => ({
          name: "Inter",
          data,
          weight,
          style: "normal",
        }))
        .catch(() => null);
    fontsPromise = Promise.all([load(400), load(500), load(700)]).then(
      (fonts) => {
        const ok = fonts.filter((f): f is SatoriFont => f !== null);
        if (ok.length === 0) fontsPromise = null; // don't cache a total failure
        return ok;
      },
    );
  }
  return fontsPromise;
}

// satori-html parses the string as HTML but does NOT decode entities, so we
// only strip the structural characters (`<` `>`) — escaping `&` would render a
// literal "&amp;". Text is otherwise passed through as-is.
function escapeHtml(s: string): string {
  return s.replace(/[<>]/g, "");
}

// Base64 data URI so Satori embeds images without a network round-trip.
function toDataUri(bytes: ArrayBuffer, mime: string): string {
  const arr = new Uint8Array(bytes);
  let bin = "";
  const chunk = 0x8000;
  for (let i = 0; i < arr.length; i += chunk) {
    bin += String.fromCharCode(...arr.subarray(i, i + chunk));
  }
  return `data:${mime || "image/png"};base64,${btoa(bin)}`;
}

function truncate(s: string, max: number): string {
  const t = s.trim();
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}

// The Mirae "M" mark + wordmark as an inline SVG data URI, tinted navy for the
// light ground. Paths lifted from public/og-default.svg (mark + wordmark glyphs).
const MARK_PATH =
  "M 1.125 37.216 L 0.317 38.025 Q 0 38.342 0 38.791 L 0 71.912 Q 0 72.515 0.476 72.886 L 1.688 73.829 Q 2.163 74.2 2.767 74.2 L 28.107 74.2 Q 28.606 74.2 29.029 73.935 L 30.106 73.261 Q 30.529 72.997 30.533 72.498 L 30.763 44.349 Q 30.769 43.637 31.245 43.107 L 32.648 41.547 Q 32.933 41.23 33.356 41.283 L 34.433 41.418 Q 34.856 41.471 35.137 41.791 L 62.459 72.917 Q 62.74 73.237 63.111 73.449 L 64.053 73.988 Q 64.423 74.2 64.85 74.2 L 80.824 74.2 Q 81.25 74.2 81.62 73.988 L 82.562 73.449 Q 82.933 73.237 82.94 72.811 L 83.402 43.867 Q 83.413 43.155 83.942 42.679 L 85.342 41.417 Q 85.817 40.99 86.399 41.254 L 87.88 41.928 Q 88.462 42.193 88.883 42.673 L 114.862 72.268 Q 116.346 73.959 118.596 73.977 L 147.163 74.195 Q 147.837 74.2 148.312 73.724 L 149.524 72.511 Q 150 72.034 149.995 71.361 L 149.763 38.631 Q 149.76 38.102 149.337 37.784 L 148.26 36.975 Q 147.837 36.658 147.308 36.647 L 138.307 36.463 Q 136.058 36.417 134.555 34.743 L 105.59 2.474 Q 104.087 0.8 101.837 0.8 L 86.461 0.8 Q 86.058 0.8 85.688 0.959 L 84.701 1.382 Q 84.375 1.522 84.216 1.84 L 83.812 2.648 Q 83.654 2.966 83.654 3.321 L 83.654 30.079 Q 83.654 30.641 83.231 31.012 L 82.091 32.01 Q 81.731 32.326 81.255 32.273 L 80.043 32.138 Q 79.567 32.085 79.251 31.726 L 53.892 2.969 Q 52.404 1.281 50.154 1.254 L 32.94 1.047 Q 32.452 1.041 32.135 1.411 L 31.327 2.355 Q 31.01 2.725 31.003 3.213 L 30.537 35.151 Q 30.529 35.695 30.053 35.96 L 28.841 36.634 Q 28.365 36.898 27.821 36.898 L 1.891 36.898 Q 1.442 36.898 1.125 37.216 Z";

function markDataUri(color: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="150" height="75" viewBox="0 0 150 75"><path fill="${color}" d="${MARK_PATH}"/></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function cardHtml(profile: StudioMeta, avatarUri: string | null): string {
  const name = escapeHtml(truncate(profile.displayName || profile.handle, 30));
  const bioRaw = profile.tagline || profile.bio || "";
  const bio = bioRaw ? escapeHtml(truncate(bioRaw, 130)) : "";
  const handle = escapeHtml(profile.handle);
  const open = profile.status === "open";
  const initial = escapeHtml(
    (profile.displayName || profile.handle).slice(0, 1).toUpperCase(),
  );

  // Right box = the studio logo (artist avatar) in a rounded-square frame;
  // falls back to a gradient tile with the initial.
  const logoBox = avatarUri
    ? `<img src="${avatarUri}" width="400" height="400" style="width:400px;height:400px;object-fit:cover;" />`
    : `<div style="display:flex;align-items:center;justify-content:center;width:400px;height:400px;background:linear-gradient(150deg,#6b93f0,#3b5bdb);font-size:190px;font-weight:700;color:#ffffff;">${initial}</div>`;

  // Status = a small dot next to the name (green ring + centre dot when open for
  // commissions, muted grey when closed).
  const statusDot = open
    ? `<div style="display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:100px;background:#ecfdf5;border:1px solid #a7f3d0;">
         <div style="display:flex;width:14px;height:14px;border-radius:100px;background:#10b981;"></div>
       </div>`
    : `<div style="display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:100px;background:#f1f3f8;border:1px solid #e3e7ef;">
         <div style="display:flex;width:14px;height:14px;border-radius:100px;background:#9aa4b8;"></div>
       </div>`;

  return `
  <div style="display:flex;width:1200px;height:630px;background:linear-gradient(150deg,#ffffff 0%,#eef2fb 100%);font-family:'Inter';">
    <div style="display:flex;position:absolute;top:0;right:0;width:640px;height:420px;background:radial-gradient(60% 70% at 80% 12%, rgba(126,160,255,0.28) 0%, rgba(126,160,255,0) 100%);"></div>

    <div style="display:flex;flex-direction:column;justify-content:center;flex:1;padding-left:72px;padding-right:40px;">
      <div style="display:flex;align-items:center;gap:16px;">
        <span style="font-size:64px;font-weight:700;line-height:1;color:#0f1320;white-space:nowrap;margin-left:-18px;">${name}</span>
        ${statusDot}
      </div>
      <div style="display:flex;margin-top:14px;">
        <span style="display:flex;font-size:28px;font-weight:500;color:#8a93ff;">usemirae.com/@${handle}</span>
      </div>
      ${bio ? `<div style="display:flex;margin-top:18px;max-width:540px;"><span style="display:flex;font-size:31px;font-weight:400;line-height:1.35;color:#64708a;">${bio}</span></div>` : ""}
      <div style="display:flex;align-items:center;gap:10px;margin-top:32px;margin-left:-3px;">
        <span style="display:flex;font-size:23px;font-weight:500;color:#0f1320;white-space:nowrap;">Powered by</span>
        <img src="${markDataUri("#0f1320")}" width="38" height="19" style="width:38px;height:19px;" />
        <span style="display:flex;font-size:23px;font-weight:700;color:#0f1320;white-space:nowrap;">Mirae</span>
      </div>
    </div>

    <div style="display:flex;align-items:center;padding-right:72px;">
      <div style="display:flex;overflow:hidden;border-radius:40px;border:1px solid rgba(15,19,32,0.08);box-shadow:0 30px 70px rgba(30,39,73,0.20);">
        ${logoBox}
      </div>
    </div>
  </div>`;
}

/** Render a studio's branded OG card as a PNG Response. */
export async function studioOgResponse(
  files: R2Bucket,
  profile: StudioMeta,
): Promise<Response> {
  let avatarUri: string | null = null;
  if (profile.avatarR2Key) {
    const obj = await files.get(profile.avatarR2Key);
    if (obj) {
      avatarUri = toDataUri(
        await obj.arrayBuffer(),
        obj.httpMetadata?.contentType ?? "image/png",
      );
    }
  }
  return new ImageResponse(cardHtml(profile, avatarUri), {
    width: 1200,
    height: 630,
    fonts: await cardFonts(),
  });
}
