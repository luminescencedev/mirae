// Read pixel dimensions from an image's header bytes — no decoding, no deps.
// Supports PNG, GIF, JPEG and WebP (VP8 / VP8L / VP8X). Returns null when the
// format isn't recognised (e.g. AVIF) so callers just store null.

export type Dimensions = { width: number; height: number };

export function imageSize(buffer: ArrayBuffer): Dimensions | null {
  const b = new Uint8Array(buffer);
  if (b.length < 24) return null;
  const dv = new DataView(buffer);

  // PNG: 89 50 4E 47 0D 0A 1A 0A, IHDR width/height are big-endian at 16/20.
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) {
    return { width: dv.getUint32(16), height: dv.getUint32(20) };
  }

  // GIF: "GIF8", logical screen width/height little-endian at 6/8.
  if (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38) {
    return { width: dv.getUint16(6, true), height: dv.getUint16(8, true) };
  }

  // WebP: "RIFF"...."WEBP" then a chunk fourCC.
  if (
    b[0] === 0x52 &&
    b[1] === 0x49 &&
    b[2] === 0x46 &&
    b[3] === 0x46 &&
    b[8] === 0x57 &&
    b[9] === 0x45 &&
    b[10] === 0x42 &&
    b[11] === 0x50
  ) {
    const fourcc = String.fromCharCode(b[12], b[13], b[14], b[15]);
    if (fourcc === "VP8 " && b.length >= 30) {
      // Lossy: 16-bit little-endian width/height (14 bits) at 26/28.
      return {
        width: dv.getUint16(26, true) & 0x3fff,
        height: dv.getUint16(28, true) & 0x3fff,
      };
    }
    if (fourcc === "VP8L" && b.length >= 25) {
      // Lossless: 14-bit dims packed from byte 21.
      const bits = b[21] | (b[22] << 8) | (b[23] << 16) | (b[24] << 24);
      return {
        width: (bits & 0x3fff) + 1,
        height: ((bits >> 14) & 0x3fff) + 1,
      };
    }
    if (fourcc === "VP8X" && b.length >= 30) {
      // Extended: canvas width-1/height-1 as 24-bit little-endian at 24/27.
      const w = b[24] | (b[25] << 8) | (b[26] << 16);
      const h = b[27] | (b[28] << 8) | (b[29] << 16);
      return { width: w + 1, height: h + 1 };
    }
    return null;
  }

  // JPEG: FF D8, then walk segment markers to a Start-Of-Frame (SOFn).
  if (b[0] === 0xff && b[1] === 0xd8) {
    let i = 2;
    while (i < b.length - 8) {
      if (b[i] !== 0xff) {
        i++;
        continue;
      }
      const marker = b[i + 1];
      // SOF0..SOF15 carry dimensions, excluding DHT(C4), JPG(C8), DAC(CC).
      if (
        marker >= 0xc0 &&
        marker <= 0xcf &&
        marker !== 0xc4 &&
        marker !== 0xc8 &&
        marker !== 0xcc
      ) {
        return {
          height: dv.getUint16(i + 5),
          width: dv.getUint16(i + 7),
        };
      }
      // Skip this segment via its length field.
      const len = dv.getUint16(i + 2);
      if (len < 2) break;
      i += 2 + len;
    }
    return null;
  }

  return null;
}
