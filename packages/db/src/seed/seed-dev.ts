import { createDb } from "../client.ts";
import {
  activityLogs,
  artistLinks,
  artistProfiles,
  clients,
  commissionRequests,
  commissionTypes,
  commissions,
  deliveries,
  files,
  portfolioProjects,
  quoteItems,
  quotes,
  users,
} from "../schema/index.ts";

// Dev seed — a demo studio (Rain Aoki) with realistic commission data.
// Idempotent: deleting the user cascades through every owned table.
const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");
const db = createDb(url);

const USER_ID = "usr_demo_rain";

console.log("Resetting demo data…");
await db.delete(users);

console.log("Seeding…");
await db.insert(users).values({
  id: USER_ID,
  name: "Rain Aoki",
  email: "rain@studio.test",
  emailVerified: true,
});

const [artist] = await db
  .insert(artistProfiles)
  .values({
    userId: USER_ID,
    handle: "rainaoki",
    displayName: "Rain Aoki",
    tagline: "Character illustrator · semi-realistic & anime",
    bio: "I take on character illustrations, key visuals and emote sets. Two revision rounds included.",
    about:
      "I've drawn characters for indie games, VTubers and tabletop for six " +
      "years. I keep my queue small so every piece gets real attention — " +
      "expect sketches, revision rounds and full source files on delivery.",
    faq: [
      {
        q: "What's your turnaround?",
        a: "Usually 2–3 weeks depending on scope and where you land in the queue.",
      },
      {
        q: "How many revisions are included?",
        a: "Two rounds on every commission; extra rounds are billed hourly.",
      },
      {
        q: "Can I use the art commercially?",
        a: "Personal use by default. Commercial licensing is a separate line item — just ask.",
      },
    ],
    status: "open",
  })
  .returning();

await db.insert(commissionTypes).values([
  {
    artistId: artist.id,
    name: "Character illustration",
    blurb: "Full-body or half-body, rendered.",
    priceFromCents: 15000,
    turnaround: "~2 weeks",
    slots: 3,
    sortOrder: 0,
  },
  {
    artistId: artist.id,
    name: "Emote / sticker set",
    blurb: "Sets of 3–10 for Twitch, Discord or Telegram.",
    priceFromCents: 9000,
    turnaround: "~1 week",
    slots: 2,
    sortOrder: 1,
  },
  {
    artistId: artist.id,
    name: "Key visual (commercial)",
    blurb: "Illustration for a launch, cover or campaign.",
    priceFromCents: 40000,
    turnaround: "3–4 weeks",
    sortOrder: 2,
  },
]);

// Link-in-bio for the public studio.
await db.insert(artistLinks).values([
  {
    artistId: artist.id,
    title: "Shop — prints & adopts",
    url: "https://example.gumroad.com",
    platform: "kofi",
    type: "shop",
    style: "featured",
    featured: true,
    position: 0,
  },
  {
    artistId: artist.id,
    title: "Commission terms",
    url: "https://example.com/terms",
    platform: "website",
    type: "custom",
    style: "card",
    position: 1,
  },
  {
    artistId: artist.id,
    title: "Instagram",
    url: "https://instagram.com/example",
    platform: "instagram",
    type: "social",
    style: "simple",
    position: 2,
  },
  {
    artistId: artist.id,
    title: "ArtStation",
    url: "https://artstation.com/example",
    platform: "artstation",
    type: "social",
    style: "simple",
    position: 3,
  },
]);

// Published portfolio projects (images are uploaded via the manager, so these
// have none — the public page still lists them with titles + descriptions).
await db.insert(portfolioProjects).values([
  {
    artistId: artist.id,
    title: "Ashfall — key art",
    slug: "ashfall-key-art",
    description: "Cover illustration for a narrative RPG. Full render.",
    projectType: "illustration",
    visibility: "published",
    featured: true,
    position: 0,
  },
  {
    artistId: artist.id,
    title: "Character lineup",
    slug: "character-lineup",
    description: "Cast exploration for an indie title.",
    projectType: "character_design",
    visibility: "published",
    position: 1,
  },
]);

const insertedClients = await db
  .insert(clients)
  .values([
    { artistId: artist.id, name: "Stellar Co.", email: "hi@stellar.test" },
    { artistId: artist.id, name: "Mai Tanaka", discord: "mai#0001" },
    { artistId: artist.id, name: "Nadia", email: "nadia@music.test" },
  ])
  .returning();

await db.insert(commissionRequests).values([
  {
    artistId: artist.id,
    clientName: "Ava Chen",
    clientEmail: "ava@mail.test",
    budget: "€150–200",
    message: "Full-body illustration of my OC, semi-realistic, cool tones.",
    status: "new",
  },
  {
    artistId: artist.id,
    clientName: "Marco",
    clientEmail: "marco@mail.test",
    budget: "€80–100",
    message: "Two chibis of me and my partner for our anniversary.",
    status: "new",
  },
]);

const [keyVisual] = await db
  .insert(commissions)
  .values([
    {
      artistId: artist.id,
      clientId: insertedClients[0].id,
      title: "Key visual",
      status: "sketch",
      priceCents: 42000,
      portalToken: "portal_stellar_kv",
    },
    {
      artistId: artist.id,
      clientId: insertedClients[1].id,
      title: "Emote set (5)",
      status: "review",
      priceCents: 15000,
      portalToken: "portal_mai_emotes",
    },
    {
      artistId: artist.id,
      clientId: insertedClients[2].id,
      title: "Album cover",
      status: "final",
      priceCents: 26000,
      portalToken: "portal_nadia_cover",
    },
  ])
  .returning();

const [quote] = await db
  .insert(quotes)
  .values({
    commissionId: keyVisual.id,
    totalCents: 42000,
    status: "sent",
    sentAt: new Date(),
  })
  .returning();

await db.insert(quoteItems).values([
  { quoteId: quote.id, label: "Illustration", amountCents: 36000 },
  { quoteId: quote.id, label: "Commercial licence", amountCents: 6000 },
]);

await db.insert(activityLogs).values([
  {
    artistId: artist.id,
    commissionId: keyVisual.id,
    type: "status",
    message: "Key visual moved to Sketch",
  },
  {
    artistId: artist.id,
    type: "request",
    message: "Ava Chen sent a new request",
  },
]);

// A finished commission with a public delivery + one deliverable file, so
// /delivery/:token has something to show. (The R2 object isn't seeded, so the
// download link is illustrative only.)
const [delivered] = await db
  .insert(commissions)
  .values({
    artistId: artist.id,
    clientId: insertedClients[2].id,
    title: "Sticker sheet",
    status: "delivered",
    priceCents: 11000,
    paidCents: 11000,
    portalToken: "portal_ludo_stickers",
  })
  .returning();

await db.insert(deliveries).values({
  commissionId: delivered.id,
  token: "deliver_ludo_stickers",
  message: "Final sticker sheet + source files attached. Thank you!",
  deliveredAt: new Date(),
});

await db.insert(files).values({
  commissionId: delivered.id,
  kind: "deliverable",
  key: "commissions/demo/sticker-sheet.png",
  name: "sticker-sheet.png",
  sizeBytes: 2_400_000,
});

console.log("✓ Seed complete — studio @rainaoki");
process.exit(0);
