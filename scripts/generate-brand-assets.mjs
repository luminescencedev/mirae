#!/usr/bin/env node
// Regenerate all raster brand assets from the vector masters. Never edit the
// PNGs by hand. Requires sharp:  pnpm add -Dw sharp  then  node scripts/generate-brand-assets.mjs
import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const publicDir = path.join(root, "apps/web/public");
const squareMaster = path.join(root, "packages/ui/src/brand/mark-square.svg");

// Square icons + avatar, from the square (padded) master.
const square = await readFile(squareMaster);
const iconExports = [
  ["favicon-16.png", 16],
  ["favicon-32.png", 32],
  ["apple-touch-icon.png", 180],
  ["icon-192.png", 192],
  ["icon-512.png", 512],
  ["icon-192-maskable.png", 192],
  ["icon-512-maskable.png", 512],
  ["avatar-social.png", 400],
];
for (const [name, size] of iconExports) {
  await sharp(square)
    .resize(size, size)
    .png()
    .toFile(path.join(publicDir, name));
}

// Open Graph cards (1200×630), from the vector OG templates — text is the
// outlined Inter wordmark, so the app typeface renders exactly, no font needed.
const ogExports = [
  ["og-default.png", "og-default.svg"],
  ["og-studio.png", "og-studio.svg"],
];
for (const [out, src] of ogExports) {
  const buf = await readFile(path.join(publicDir, src));
  await sharp(buf).resize(1200, 630).png().toFile(path.join(publicDir, out));
}

console.log(
  `Generated ${iconExports.length} icons + ${ogExports.length} OG cards from vector masters`,
);
