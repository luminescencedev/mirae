// Unguessable, URL-safe tokens for public token-addressed pages (portal,
// delivery). 32 random bytes (256 bits) via the Web Crypto CSPRNG, base64url
// encoded — comfortably beyond brute-force reach. Replaces ad-hoc UUID tokens
// (~122 bits) with a single audited generator.

export function newToken(bytes = 32): string {
  const buf = new Uint8Array(bytes);
  crypto.getRandomValues(buf);
  let bin = "";
  for (const b of buf) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
