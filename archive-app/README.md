# The Bennett Archive

A small web app that houses the **Bennett / Midnight Archive** material (Issue 001 — the Point Pleasant Mothman) and lets you **chat with it** — plus a **creator dashboard** that tracks your subscribers, social performance, and today's orders, and tells you what to make next.

It's an ordinary web page you open in a browser: no phone number, no SMS fees. Everything is powered by the Claude API on the backend.

## Two tabs

**Chat** — Ask questions about the archive (the Mothman story, the field kit, etc.) and tell it to record new things ("add a note that…"). The AI updates the archive as you talk. You can also feed it numbers here ("TikTok's at 12.4k", "the mothman reel got 60k views") and it logs them.

**Dashboard** — At-a-glance creator metrics:
- **Headline subscriber count** (your "daily" number) with the change since you last logged it.
- **Channels** — subscriber/follower counts per platform (TikTok, Instagram, YouTube, newsletter — whatever you add).
- **Top-performing content** — your logged posts ranked by views/engagement.
- **What should I make next?** — the AI analyzes your performance history and gives specific, data-backed content recommendations.
- **Orders today** — live from Shopify if you connect it (below), otherwise a prompt to connect.

Numbers get in three ways: type them into the dashboard's quick-log form, tell the chat, or POST to the REST API (`/api/metrics/channel`, `/api/metrics/post`). No live social-media APIs are wired up (those need per-platform developer tokens); the app is structured so they can be added later.

## What's inside

- `server.js` — Node/Express backend. Serves the UI, exposes a REST API for the archive + metrics, runs chat/analysis through the Claude API (model `claude-opus-5`) with tools so the AI can update the archive and log metrics, and pulls Shopify orders when configured.
- `public/index.html` — the Chat + Dashboard UI (single self-contained file).
- `data/seed/*.md` — the starting archive, extracted from the Mothman/Midnight Archive files in Google Drive.
- `data/store.json` / `data/metrics.json` — the live archive and metrics (created on first boot; **git-ignored**, so your data stays on your host).

## Run it locally

You need [Node.js 20+](https://nodejs.org).

```bash
cd archive-app
npm install
cp .env.example .env          # then edit .env and paste your Anthropic API key
npm start
```

Open http://localhost:3000.

Get an API key at https://console.anthropic.com/settings/keys. Without a key the archive still browses, but chat is disabled (the app tells you so).

## Put it online (so you can reach it from your phone)

The app is a normal Node web service — any host that runs Node works. Easiest free option is **Render**:

1. Push this repo to GitHub (the branch is already set up).
2. Go to [render.com](https://render.com) → **New +** → **Blueprint** → pick this repo. It reads `render.yaml` automatically.
3. When prompted, set the `ANTHROPIC_API_KEY` environment variable to your key.
4. Deploy. Render gives you a public `https://…onrender.com` URL you can open on your phone and chat with from anywhere.

> Note on the free tier: Render's free plan uses an ephemeral disk, so entries you add via chat can reset when the service restarts. For durable storage, use a paid plan with a persistent disk mounted at `archive-app/data`, or swap the JSON store for a hosted database. Fly.io, Railway, and a small VPS work the same way.

## Connect Shopify (for live "orders today")

Optional. In your Shopify admin: **Settings → Apps and sales channels → Develop apps → Create an app**, grant it the **`read_orders`** scope, install it, and copy the **Admin API access token** (`shpat_…`). Set two env vars (locally in `.env`, or in your host's dashboard):

```
SHOPIFY_STORE=your-shop.myshopify.com
SHOPIFY_ADMIN_TOKEN=shpat_...
```

The dashboard's "Orders today" card then shows the live count and revenue for the current day. Without these, it just shows a "connect Shopify" prompt.

## How chat updates the archive

When you type something like *"add a note that the mothman was first sighted November 15, 1966"*, the model calls an `add_entry` tool and the entry is written to `data/store.json`. Editing and deleting work the same way (`update_entry`, `delete_entry`). You can also manage entries directly via the REST API (`GET/POST/PUT/DELETE /api/entries`).

## Privacy note

The customer shipping list and address file from Drive were **not** included — they're personal data and don't belong in a shared archive. Only the creative/story material was seeded. Add fulfillment data privately later if you need it.
