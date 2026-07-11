// Server-rendered Open Graph HTML for social crawlers hitting /@handle.
// Humans get the SPA; only known bots get this meta-only document.

// Common link-unfurling crawlers (chat apps, social networks, search).
const BOT_UA =
  /(facebookexternalhit|Facebot|Twitterbot|Slackbot|Discordbot|WhatsApp|TelegramBot|LinkedInBot|Pinterest|redditbot|Applebot|Googlebot|bingbot|DuckDuckBot|embedly|Iframely|vkShare|Mastodon|Threads|Bluesky|SkypeUriPreview|ia_archiver)/i;

export function isSocialBot(ua: string | undefined | null): boolean {
  return !!ua && BOT_UA.test(ua);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

type StudioMeta = {
  handle: string;
  displayName: string;
  tagline: string | null;
  bio: string | null;
};

export function renderStudioOg(profile: StudioMeta, origin: string): string {
  const title = `${profile.displayName} · Commissions`;
  const rawDesc =
    profile.tagline ||
    profile.bio ||
    `Request a commission from ${profile.displayName} on Mirae.`;
  const desc = rawDesc.length > 200 ? `${rawDesc.slice(0, 197)}…` : rawDesc;
  const url = `${origin}/@${profile.handle}`;

  const t = escapeHtml(title);
  const d = escapeHtml(desc);
  const u = escapeHtml(url);

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${t}</title>
<meta name="description" content="${d}" />
<meta property="og:type" content="profile" />
<meta property="og:site_name" content="Mirae" />
<meta property="og:title" content="${t}" />
<meta property="og:description" content="${d}" />
<meta property="og:url" content="${u}" />
<meta name="twitter:card" content="summary" />
<meta name="twitter:title" content="${t}" />
<meta name="twitter:description" content="${d}" />
</head>
<body>
<h1>${escapeHtml(profile.displayName)}</h1>
<p>${d}</p>
<p><a href="${u}">View this studio on Mirae</a></p>
</body>
</html>`;
}
