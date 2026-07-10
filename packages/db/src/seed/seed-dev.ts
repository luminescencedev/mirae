import { createDb } from "../client.ts";
import {
  activityLogs,
  artistProfiles,
  clients,
  commissionRequests,
  commissionTypes,
  commissions,
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

console.log("✓ Seed complete — studio @rainaoki");
process.exit(0);
