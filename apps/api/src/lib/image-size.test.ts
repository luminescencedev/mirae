import { describe, expect, it } from "vitest";
import { imageSize } from "./image-size.ts";

// Minimal valid headers for each format, big enough to satisfy the parser.
function pngHeader(w: number, h: number): ArrayBuffer {
  const b = new Uint8Array(24);
  b.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]); // signature
  const dv = new DataView(b.buffer);
  dv.setUint32(16, w);
  dv.setUint32(20, h);
  return b.buffer;
}

function gifHeader(w: number, h: number): ArrayBuffer {
  const b = new Uint8Array(24);
  b.set([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]); // GIF89a
  const dv = new DataView(b.buffer);
  dv.setUint16(6, w, true);
  dv.setUint16(8, h, true);
  return b.buffer;
}

describe("imageSize", () => {
  it("reads PNG dimensions", () => {
    expect(imageSize(pngHeader(1200, 630))).toEqual({
      width: 1200,
      height: 630,
    });
  });

  it("reads GIF dimensions (little-endian)", () => {
    expect(imageSize(gifHeader(64, 48))).toEqual({ width: 64, height: 48 });
  });

  it("returns null for unrecognised / too-short data", () => {
    expect(imageSize(new Uint8Array([1, 2, 3]).buffer)).toBeNull();
    expect(imageSize(new Uint8Array(24).buffer)).toBeNull();
  });
});
