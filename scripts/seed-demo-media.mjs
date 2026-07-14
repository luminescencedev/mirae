#!/usr/bin/env node
// Generates the demo studio's placeholder artwork (tasteful gradients) and
// uploads each image to R2 at the exact keys the seed references, so
// @rainaoki's studio, portfolio, avatar and cover render fully.
//
// Prereqs: `wrangler login` (writes to the real mirae-files bucket).
// Run after `pnpm db:seed`:  node scripts/seed-demo-media.mjs
//
// Swap for real art anytime: re-upload to the same key.

import { Buffer } from "node:buffer";
import { execSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";
import {
  AVATAR,
  COVER,
  DELIVERABLE,
  allMedia,
} from "../packages/db/src/seed/demo-media.ts";

const BUCKET = "mirae-files";
const dir = mkdtempSync(join(tmpdir(), "mirae-demo-"));

function svg({ w, h, hue, label, big }) {
  const c1 = `hsl(${hue}, 62%, 56%)`;
  const c2 = `hsl(${(hue + 34) % 360}, 56%, 34%)`;
  const glow = `hsl(${(hue + 12) % 360}, 80%, 70%)`;
  const text = big
    ? `<text x="50%" y="50%" dy="0.36em" text-anchor="middle" fill="rgba(255,255,255,0.92)" font-family="Inter, Arial, sans-serif" font-weight="700" font-size="${Math.round(h * 0.42)}">${label}</text>`
    : label
      ? `<text x="6%" y="90%" fill="rgba(255,255,255,0.9)" font-family="Inter, Arial, sans-serif" font-weight="600" font-size="${Math.round(Math.min(w, h) * 0.06)}">${label}</text>`
      : "";
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${c1}"/>
          <stop offset="100%" stop-color="${c2}"/>
        </linearGradient>
        <radialGradient id="glow" cx="26%" cy="22%" r="70%">
          <stop offset="0%" stop-color="${glow}" stop-opacity="0.5"/>
          <stop offset="100%" stop-color="${glow}" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#g)"/>
      <rect width="100%" height="100%" fill="url(#glow)"/>
      ${text}
    </svg>`,
  );
}

// Avatar gets the initial; everything else gets a small label.
const items = allMedia().map((m) => {
  if (m.key === AVATAR.key) return { ...m, label: "R", big: true };
  if (m.key === COVER.key) return { ...m, label: "" };
  if (m.key === DELIVERABLE.key) return { ...m, label: "Sticker sheet" };
  return m; // portfolio assets already carry `label`
});

console.log(`Generating + uploading ${items.length} images to ${BUCKET}…`);
for (const m of items) {
  const file = join(dir, m.key.replaceAll("/", "_"));
  const png = await sharp(svg(m)).png().toBuffer();
  writeFileSync(file, png);
  execSync(
    `npx wrangler r2 object put "${BUCKET}/${m.key}" --file "${file}" --content-type image/png --remote`,
    { stdio: "inherit" },
  );
  console.log(`  ✓ ${m.key}`);
}

console.log("\n✓ Demo media uploaded. Visit /@rainaoki");
