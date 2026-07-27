# The Bennett Archive

A small web app that houses the **Bennett / Midnight Archive** material (Issue 001 — the Point Pleasant Mothman) and lets you **chat with it**. Ask it questions about the story, the field kit, the Seedance scripts, or the Echoes episode, and tell it to record new things — it updates the archive as you talk.

It's an ordinary web page you open in a browser: no phone number, no SMS fees. Everything is powered by the Claude API on the backend.

## What's inside

- `server.js` — Node/Express backend. Serves the UI, exposes a small REST API for the archive, and runs the chat through the Claude API (model `claude-opus-5`) with tools so the AI can add/update/delete entries when you ask.
- `public/index.html` — the chat + archive-browser UI (single self-contained file).
- `data/seed/*.md` — the starting archive, extracted from the Mothman/Midnight Archive files in Google Drive.
- `data/store.json` — the live archive (created on first boot from the seed; **git-ignored**, so your edits stay local/on your host).

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

## How chat updates the archive

When you type something like *"add a note that the mothman was first sighted November 15, 1966"*, the model calls an `add_entry` tool and the entry is written to `data/store.json`. Editing and deleting work the same way (`update_entry`, `delete_entry`). You can also manage entries directly via the REST API (`GET/POST/PUT/DELETE /api/entries`).

## Privacy note

The customer shipping list and address file from Drive were **not** included — they're personal data and don't belong in a shared archive. Only the creative/story material was seeded. Add fulfillment data privately later if you need it.
