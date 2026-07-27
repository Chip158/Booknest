import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "data");
const SEED_DIR = path.join(DATA_DIR, "seed");
const STORE_PATH = path.join(DATA_DIR, "store.json");
const METRICS_PATH = path.join(DATA_DIR, "metrics.json");

const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-5";
const PORT = process.env.PORT || 3000;

// Optional Shopify Admin API config for live "orders today".
const SHOPIFY_STORE = process.env.SHOPIFY_STORE || ""; // e.g. my-shop.myshopify.com
const SHOPIFY_ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_TOKEN || "";
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || "2024-10";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function slugify(text) {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "item"
  );
}
function nowIso() {
  return new Date().toISOString();
}
function today() {
  return new Date().toISOString().slice(0, 10);
}
function readJson(file, fallback) {
  if (fs.existsSync(file)) {
    try {
      return JSON.parse(fs.readFileSync(file, "utf8"));
    } catch {
      /* fall through */
    }
  }
  return fallback;
}
function writeJson(file, obj) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(file, JSON.stringify(obj, null, 2));
}

// ---------------------------------------------------------------------------
// Archive store (seeded from data/seed on first boot)
// ---------------------------------------------------------------------------

function loadSeedEntries() {
  if (!fs.existsSync(SEED_DIR)) return [];
  return fs
    .readdirSync(SEED_DIR)
    .filter((f) => f.endsWith(".md"))
    .sort()
    .map((file) => {
      const raw = fs.readFileSync(path.join(SEED_DIR, file), "utf8");
      const lines = raw.split("\n");
      let title = file.replace(/\.md$/, "");
      const h = lines.findIndex((l) => l.startsWith("# "));
      if (h !== -1) title = lines[h].replace(/^#\s+/, "").trim();
      return {
        id: slugify(file.replace(/\.md$/, "")),
        title,
        category: "Midnight Archive · 001 Mothman",
        content: raw.trim(),
        source: "Google Drive (seed)",
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
    });
}

let store = readJson(STORE_PATH, null);
if (!store) {
  store = { entries: loadSeedEntries() };
  writeJson(STORE_PATH, store);
}
const saveStore = () => writeJson(STORE_PATH, store);

// ---------------------------------------------------------------------------
// Metrics store: channels (subscriber counts + history) and posts (per-piece
// performance). Everything can be entered by hand, via the REST API, or by
// telling the AI in chat.
// ---------------------------------------------------------------------------

let metrics = readJson(METRICS_PATH, { channels: [], posts: [] });
const saveMetrics = () => writeJson(METRICS_PATH, metrics);

function upsertChannel({ name, platform, subscribers, isPrimary }) {
  const key = slugify(`${platform || ""}-${name}`);
  let ch = metrics.channels.find((c) => c.id === key);
  if (!ch) {
    ch = { id: key, name, platform: platform || name, subscribers: 0, isPrimary: false, history: [] };
    metrics.channels.push(ch);
  }
  if (typeof subscribers === "number" && !Number.isNaN(subscribers)) {
    ch.subscribers = subscribers;
    const d = today();
    const existing = ch.history.find((h) => h.date === d);
    if (existing) existing.subscribers = subscribers;
    else ch.history.push({ date: d, subscribers });
  }
  if (isPrimary) {
    for (const c of metrics.channels) c.isPrimary = c.id === key;
  }
  saveMetrics();
  return ch;
}

function logPost({ channel, title, contentType, views, likes, comments, shares, notes, date }) {
  const post = {
    id: `${slugify(title || "post")}-${Date.now().toString(36)}`,
    channel: channel || "unspecified",
    title: title || "(untitled)",
    contentType: contentType || "unspecified",
    views: Number(views) || 0,
    likes: Number(likes) || 0,
    comments: Number(comments) || 0,
    shares: Number(shares) || 0,
    notes: notes || "",
    date: date || today(),
    createdAt: nowIso(),
  };
  metrics.posts.push(post);
  saveMetrics();
  return post;
}

function engagement(p) {
  // Simple engagement proxy: interactions per view (falls back to raw sum).
  const interactions = p.likes + p.comments + p.shares;
  return p.views > 0 ? interactions / p.views : interactions;
}

function performanceSummary() {
  const primary =
    metrics.channels.find((c) => c.isPrimary) || metrics.channels[0] || null;
  const byViews = [...metrics.posts].sort((a, b) => b.views - a.views);
  return {
    primary,
    channels: metrics.channels,
    totalPosts: metrics.posts.length,
    topByViews: byViews.slice(0, 5),
    topByEngagement: [...metrics.posts]
      .sort((a, b) => engagement(b) - engagement(a))
      .slice(0, 5),
  };
}

// ---------------------------------------------------------------------------
// Shopify — today's orders (live if configured, else "not configured")
// ---------------------------------------------------------------------------

async function ordersToday() {
  if (!SHOPIFY_STORE || !SHOPIFY_ADMIN_TOKEN) {
    return { configured: false };
  }
  const min = `${today()}T00:00:00Z`;
  const url = `https://${SHOPIFY_STORE}/admin/api/${SHOPIFY_API_VERSION}/orders.json?status=any&created_at_min=${encodeURIComponent(min)}&limit=250`;
  const res = await fetch(url, {
    headers: { "X-Shopify-Access-Token": SHOPIFY_ADMIN_TOKEN },
  });
  if (!res.ok) {
    return { configured: true, error: `Shopify ${res.status}` };
  }
  const data = await res.json();
  const orders = data.orders || [];
  const revenue = orders.reduce(
    (sum, o) => sum + parseFloat(o.total_price || "0"),
    0,
  );
  const currency = orders[0]?.currency || "USD";
  return {
    configured: true,
    count: orders.length,
    revenue: Math.round(revenue * 100) / 100,
    currency,
    orders: orders.slice(0, 25).map((o) => ({
      name: o.name,
      total: o.total_price,
      currency: o.currency,
      customer:
        [o.customer?.first_name, o.customer?.last_name].filter(Boolean).join(" ") ||
        "Guest",
      createdAt: o.created_at,
    })),
  };
}

// ---------------------------------------------------------------------------
// Anthropic chat + content analysis
// ---------------------------------------------------------------------------

const anthropic = process.env.ANTHROPIC_API_KEY ? new Anthropic() : null;

function archiveAsText() {
  if (store.entries.length === 0) return "(The archive is currently empty.)";
  return store.entries
    .map(
      (e) =>
        `<entry id="${e.id}" title="${e.title}" category="${e.category}">\n${e.content}\n</entry>`,
    )
    .join("\n\n");
}

function metricsAsText() {
  const s = performanceSummary();
  const chans = s.channels.length
    ? s.channels
        .map(
          (c) =>
            `- ${c.name} (${c.platform})${c.isPrimary ? " [primary]" : ""}: ${c.subscribers} subscribers`,
        )
        .join("\n")
    : "(no channels logged yet)";
  const posts = metrics.posts.length
    ? metrics.posts
        .map(
          (p) =>
            `- [${p.date}] "${p.title}" on ${p.channel} · type=${p.contentType} · views=${p.views} likes=${p.likes} comments=${p.comments} shares=${p.shares}${p.notes ? ` · notes: ${p.notes}` : ""}`,
        )
        .join("\n")
    : "(no posts logged yet)";
  return `SUBSCRIBER / CHANNEL COUNTS:\n${chans}\n\nCONTENT PERFORMANCE HISTORY:\n${posts}`;
}

const SYSTEM_INSTRUCTIONS = `You are the keeper of the Bennett Archive (the "Midnight Archive" project — Issue 001 is the Point Pleasant Mothman) and the analyst for its creator's channels.

You can do two things:
1. ARCHIVE — answer questions from the archive content and record/update/delete entries when asked.
2. METRICS — track subscriber counts and content performance, and advise on what's working and what to make next.

Behaviour:
- Answer from the archive and the metrics history below. If something isn't there, say so plainly rather than inventing it.
- When the user gives you numbers ("TikTok's at 12.4k", "the mothman reel got 60k views"), record them with the tools.
- When asked what's performing best or what to make, reason from the CONTENT PERFORMANCE HISTORY — cite specific posts and the pattern behind them, then give concrete, specific recommendations.
- Keep replies focused and conversational — this is a text chat.

--- LIVE DATA ---`;

const TOOLS = [
  {
    name: "add_entry",
    description: "Add a new entry to the archive.",
    input_schema: {
      type: "object",
      properties: {
        title: { type: "string" },
        category: { type: "string" },
        content: { type: "string" },
      },
      required: ["title", "content"],
    },
  },
  {
    name: "update_entry",
    description: "Update an existing archive entry by id (only provided fields change).",
    input_schema: {
      type: "object",
      properties: {
        id: { type: "string" },
        title: { type: "string" },
        category: { type: "string" },
        content: { type: "string" },
      },
      required: ["id"],
    },
  },
  {
    name: "delete_entry",
    description: "Delete an archive entry by id.",
    input_schema: {
      type: "object",
      properties: { id: { type: "string" } },
      required: ["id"],
    },
  },
  {
    name: "set_subscribers",
    description:
      "Set the current subscriber/follower count for a channel. Creates the channel if new. Records a dated history point.",
    input_schema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Channel name, e.g. 'The Daily' or 'Main TikTok'" },
        platform: {
          type: "string",
          description: "Platform, e.g. TikTok, Instagram, YouTube, Newsletter",
        },
        subscribers: { type: "number" },
        isPrimary: {
          type: "boolean",
          description: "Mark this as the headline 'daily' subscriber number",
        },
      },
      required: ["name", "subscribers"],
    },
  },
  {
    name: "log_post",
    description: "Log the performance of a piece of content.",
    input_schema: {
      type: "object",
      properties: {
        channel: { type: "string" },
        title: { type: "string" },
        contentType: {
          type: "string",
          description: "e.g. 'reel', 'talking-head', 'lore', 'BTS', 'field-kit'",
        },
        views: { type: "number" },
        likes: { type: "number" },
        comments: { type: "number" },
        shares: { type: "number" },
        notes: { type: "string" },
        date: { type: "string", description: "YYYY-MM-DD; defaults to today" },
      },
      required: ["title"],
    },
  },
];

function runTool(name, input) {
  switch (name) {
    case "add_entry": {
      const entry = {
        id: `${slugify(input.title)}-${Date.now().toString(36)}`,
        title: input.title,
        category: input.category || "Notes",
        content: input.content,
        source: "Added via chat",
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      store.entries.push(entry);
      saveStore();
      return { ok: true, id: entry.id, message: `Added "${entry.title}".` };
    }
    case "update_entry": {
      const e = store.entries.find((x) => x.id === input.id);
      if (!e) return { ok: false, message: `No entry with id ${input.id}.` };
      if (input.title !== undefined) e.title = input.title;
      if (input.category !== undefined) e.category = input.category;
      if (input.content !== undefined) e.content = input.content;
      e.updatedAt = nowIso();
      saveStore();
      return { ok: true, id: e.id, message: `Updated "${e.title}".` };
    }
    case "delete_entry": {
      const i = store.entries.findIndex((x) => x.id === input.id);
      if (i === -1) return { ok: false, message: `No entry with id ${input.id}.` };
      const [r] = store.entries.splice(i, 1);
      saveStore();
      return { ok: true, message: `Deleted "${r.title}".` };
    }
    case "set_subscribers": {
      const ch = upsertChannel(input);
      return { ok: true, message: `${ch.name}: ${ch.subscribers} subscribers.` };
    }
    case "log_post": {
      const p = logPost(input);
      return { ok: true, id: p.id, message: `Logged "${p.title}" (${p.views} views).` };
    }
    default:
      return { ok: false, message: `Unknown tool ${name}.` };
  }
}

async function chat(history) {
  if (!anthropic)
    throw new Error(
      "ANTHROPIC_API_KEY is not set — add it (see .env.example) so the archive can chat.",
    );

  const system = [
    { type: "text", text: SYSTEM_INSTRUCTIONS },
    { type: "text", text: metricsAsText() },
    { type: "text", text: "--- ARCHIVE ---\n" + archiveAsText(), cache_control: { type: "ephemeral" } },
  ];

  const messages = history.map((m) => ({ role: m.role, content: m.content }));

  for (let step = 0; step < 6; step++) {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 4096,
      thinking: { type: "adaptive" },
      system,
      tools: TOOLS,
      messages,
    });
    messages.push({ role: "assistant", content: response.content });

    if (response.stop_reason === "tool_use") {
      const results = [];
      for (const b of response.content) {
        if (b.type === "tool_use") {
          results.push({
            type: "tool_result",
            tool_use_id: b.id,
            content: JSON.stringify(runTool(b.name, b.input)),
          });
        }
      }
      messages.push({ role: "user", content: results });
      continue;
    }
    const text = response.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();
    return { reply: text || "(no reply)" };
  }
  return { reply: "I got stuck in a loop — please try rephrasing." };
}

async function analyzeContent() {
  if (!anthropic)
    throw new Error("ANTHROPIC_API_KEY is not set — add it to run content analysis.");
  if (metrics.posts.length === 0)
    return {
      analysis:
        "No content logged yet. Log a few posts (title, type, views, likes) and I'll tell you what's working and what to make next.",
    };

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1500,
    thinking: { type: "adaptive" },
    system:
      "You are a sharp, practical content strategist for a horror/folklore creator (the Midnight Archive / Mothman project). Analyse the performance data and be specific and concrete — no generic advice.",
    messages: [
      {
        role: "user",
        content: `Here is my channel and content performance data:\n\n${metricsAsText()}\n\nGive me:\n1. What's performing best and the clear pattern behind it (cite specific posts).\n2. What's underperforming and why.\n3. Three specific content ideas I should make next, each tied to the data.\nKeep it tight and skimmable.`,
      },
    ],
  });
  const analysis = response.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();
  return { analysis };
}

// ---------------------------------------------------------------------------
// HTTP API
// ---------------------------------------------------------------------------

const app = express();
app.use(express.json({ limit: "2mb" }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", (_req, res) =>
  res.json({
    ok: true,
    hasKey: Boolean(anthropic),
    entries: store.entries.length,
    shopify: Boolean(SHOPIFY_STORE && SHOPIFY_ADMIN_TOKEN),
  }),
);

// --- archive ---
app.get("/api/entries", (_req, res) =>
  res.json(
    store.entries.map(({ id, title, category, source, updatedAt }) => ({
      id,
      title,
      category,
      source,
      updatedAt,
    })),
  ),
);
app.get("/api/entries/:id", (req, res) => {
  const e = store.entries.find((x) => x.id === req.params.id);
  if (!e) return res.status(404).json({ error: "Not found" });
  res.json(e);
});
app.post("/api/entries", (req, res) => {
  const { title, category, content } = req.body || {};
  if (!title || !content)
    return res.status(400).json({ error: "title and content are required" });
  res.status(201).json(runTool("add_entry", { title, category, content }));
});
app.put("/api/entries/:id", (req, res) => {
  const r = runTool("update_entry", { id: req.params.id, ...req.body });
  res.status(r.ok ? 200 : 404).json(r);
});
app.delete("/api/entries/:id", (req, res) => {
  const r = runTool("delete_entry", { id: req.params.id });
  res.status(r.ok ? 200 : 404).json(r);
});

// --- metrics / dashboard ---
app.get("/api/dashboard", async (_req, res) => {
  const s = performanceSummary();
  let orders;
  try {
    orders = await ordersToday();
  } catch (err) {
    orders = { configured: true, error: err.message };
  }
  const primary = s.primary;
  let subscriberDelta = null;
  if (primary && primary.history.length >= 2) {
    const h = primary.history;
    subscriberDelta = h[h.length - 1].subscribers - h[h.length - 2].subscribers;
  }
  res.json({
    primary,
    subscriberDelta,
    channels: s.channels,
    topByViews: s.topByViews,
    topByEngagement: s.topByEngagement,
    totalPosts: s.totalPosts,
    orders,
  });
});
app.post("/api/metrics/channel", (req, res) => {
  const { name, platform, subscribers, isPrimary } = req.body || {};
  if (!name) return res.status(400).json({ error: "name is required" });
  const ch = upsertChannel({
    name,
    platform,
    subscribers: subscribers === undefined ? undefined : Number(subscribers),
    isPrimary: Boolean(isPrimary),
  });
  res.json({ ok: true, channel: ch });
});
app.post("/api/metrics/post", (req, res) => {
  const b = req.body || {};
  if (!b.title) return res.status(400).json({ error: "title is required" });
  res.status(201).json({ ok: true, post: logPost(b) });
});
app.delete("/api/metrics/post/:id", (req, res) => {
  const i = metrics.posts.findIndex((p) => p.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: "Not found" });
  metrics.posts.splice(i, 1);
  saveMetrics();
  res.json({ ok: true });
});
app.get("/api/orders/today", async (_req, res) => {
  try {
    res.json(await ordersToday());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/analyze", async (_req, res) => {
  try {
    res.json(await analyzeContent());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// --- chat ---
app.post("/api/chat", async (req, res) => {
  try {
    const history = Array.isArray(req.body?.messages) ? req.body.messages : null;
    if (!history || history.length === 0)
      return res.status(400).json({ error: "messages[] is required" });
    const { reply } = await chat(history);
    res.json({ reply, entries: store.entries.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Chat failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Bennett Archive on http://localhost:${PORT}`);
  console.log(
    `Model: ${MODEL} · Entries: ${store.entries.length} · Channels: ${metrics.channels.length} · API key: ${anthropic ? "set" : "MISSING"} · Shopify: ${SHOPIFY_STORE && SHOPIFY_ADMIN_TOKEN ? "configured" : "off"}`,
  );
});
