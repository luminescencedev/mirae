// SEO + Open Graph for public studio pages. We inject per-studio metadata into
// the real index.html (so humans boot the SPA and crawlers/social scrapers get
// correct head tags) — no cloaking, no separate bot document.

function escapeAttr(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Safe to embed inside a <script type="application/ld+json"> block.
function jsonLd(obj: unknown): string {
  return JSON.stringify(obj).replace(/</g, "\\u003c");
}

export type StudioMeta = {
  handle: string;
  displayName: string;
  tagline: string | null;
  bio: string | null;
  status: string;
  avatarR2Key: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  updatedAt?: Date | string | null;
};

// Branded, composited OG card served by the Worker. Versioned by updatedAt so
// social scrapers refetch after a profile edit.
function studioImageUrl(profile: StudioMeta, origin: string): string {
  const v = profile.updatedAt ? new Date(profile.updatedAt).getTime() : 0;
  return `${origin}/og/studio/${profile.handle}?v=${v}`;
}

/** Rewrite the base index.html <head> with this studio's SEO/OG metadata. */
export function injectStudioMeta(
  html: string,
  profile: StudioMeta,
  origin: string,
): string {
  const title =
    profile.metaTitle?.trim() || `${profile.displayName} · Commissions · Mirae`;
  const rawDesc =
    profile.metaDescription?.trim() ||
    profile.tagline ||
    profile.bio ||
    `Request a commission from ${profile.displayName} on Mirae.`;
  const desc = rawDesc.length > 200 ? `${rawDesc.slice(0, 197)}…` : rawDesc;
  const url = `${origin}/@${profile.handle}`;
  const image = studioImageUrl(profile, origin);
  const closed = profile.status === "closed";

  const t = escapeAttr(title);
  const d = escapeAttr(desc);
  const u = escapeAttr(url);
  const img = escapeAttr(image);

  const ld = jsonLd({
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Person",
      name: profile.displayName,
      description: desc,
      url,
      image,
    },
  });

  // Tags with no base equivalent — injected before </head>.
  const inject = [
    `<link rel="canonical" href="${u}" />`,
    `<meta name="robots" content="${closed ? "noindex, follow" : "index, follow"}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:type" content="image/png" />`,
    `<meta property="og:image:alt" content="${escapeAttr(profile.displayName)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:image" content="${img}" />`,
    `<script type="application/ld+json">${ld}</script>`,
  ].join("\n    ");

  // Replace the landing defaults with studio-specific values (no duplicates).
  return html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${t}</title>`)
    .replace(
      /<meta name="description"[^>]*>/,
      `<meta name="description" content="${d}" />`,
    )
    .replace(
      /<meta property="og:type"[^>]*>/,
      `<meta property="og:type" content="profile" />`,
    )
    .replace(
      /<meta property="og:title"[^>]*>/,
      `<meta property="og:title" content="${t}" />`,
    )
    .replace(
      /<meta property="og:description"[^>]*>/,
      `<meta property="og:description" content="${d}" />`,
    )
    .replace(
      /<meta property="og:url"[^>]*>/,
      `<meta property="og:url" content="${u}" />`,
    )
    .replace(
      /<meta property="og:image"[^>]*>/,
      `<meta property="og:image" content="${img}" />`,
    )
    .replace(
      /<meta name="twitter:title"[^>]*>/,
      `<meta name="twitter:title" content="${t}" />`,
    )
    .replace(
      /<meta name="twitter:description"[^>]*>/,
      `<meta name="twitter:description" content="${d}" />`,
    )
    .replace("</head>", `    ${inject}\n  </head>`);
}
