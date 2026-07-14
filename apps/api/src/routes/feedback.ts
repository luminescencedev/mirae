import { Hono } from "hono";
import { betaFeedback, createDb } from "@mirae/db";
import { type AuthEnv } from "../auth.ts";
import { getArtist } from "../lib/session.ts";

export const feedbackRoutes = new Hono<{ Bindings: AuthEnv }>();

const SENTIMENTS = new Set(["good", "idea", "bug"]);

// POST /api/feedback — in-app beta feedback from the signed-in artist.
feedbackRoutes.post("/", async (c) => {
  const artist = await getArtist(c);
  if (!artist) return c.json({ error: "unauthorized" }, 401);

  const body = (await c.req.json().catch(() => ({}))) as {
    message?: unknown;
    sentiment?: unknown;
    page?: unknown;
  };
  const message = String(body.message ?? "").trim();
  if (!message) return c.json({ error: "Message is required." }, 400);

  const sentiment = SENTIMENTS.has(String(body.sentiment))
    ? String(body.sentiment)
    : null;
  const page = typeof body.page === "string" ? body.page.slice(0, 200) : null;

  const db = createDb(c.env.DATABASE_URL);
  await db.insert(betaFeedback).values({
    artistId: artist.id,
    message: message.slice(0, 4000),
    sentiment,
    page,
  });
  return c.json({ ok: true }, 201);
});
