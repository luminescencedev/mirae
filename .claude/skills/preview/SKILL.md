---
name: preview
description: Launch the Mirae local preview (web + api together) and tell the user exactly what to inspect for the current ticket. Use when the user says "preview", or after implementing a ticket so they can validate visually before shipping.
---

# Skill: preview — run the local preview + say what to check

The user validates **visually**. Nothing ships until they approve the preview.

## 1. Start both processes

```bash
pnpm dev
```

Runs in parallel via `turbo run dev`:

```txt
web:  http://localhost:5173            (vite, strictPort; proxies /api/* to the Worker)
api:  http://localhost:8787/health     (wrangler dev — should return {"status":"ok"})
```

If a port is stuck from a previous run, kill stray `node`/`workerd`/`wrangler` processes first, then retry.

## 2. Point at what changed

Tell the user the exact routes/screens/behaviour this ticket touched, e.g.:

- "Open http://localhost:5173/app/requests — the inbox list + detail panel."
- "Submit the form at /@demo/request — should create a request and show a toast."

## 3. For UI tickets — recall the quality bar

From `docs/DESIGN_SYSTEM.md`: pure white/black/zinc, pastel blue accent used tastefully, one clean border around dashboard containers, intentional single sidebar, premium-product-shot feel, calm empty states. No beige, no shadcn default look.

## 4. Wait

Ask for a verdict. Approval phrases: `ship it` · `push` · `validé` · `c'est bon pour moi` · `j'aime bien`. If the user dislikes it, ask what to adjust (or apply their explicit feedback) — do **not** ship.
