import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "data");
const SEED_DIR = path.join(DATA_DIR, "seed");
const STORE_PATH = path.join(DATA_DIR, "store.json");

const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-5";
const PORT = process.env.PORT || 3000;

// ---------------------------------------------------------------------------
// Data store: a flat JSON file of archive entries. Seeded once from data/seed
// on first boot, then owned by the app (adds/edits persist here).
// ---------------------------------------------------------------------------

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "entry";
}

function nowIso() {
  return new Date().toISOString();
}

function loadSeedEntries() {
  if (!fs.existsSync(SEED_DIR)) return [];
  const files = fs
    .readdirSync(SEED_DIR)
    .filter((f) => f.endsWith(".md"))
    .sort();
  return files.map((file) => {
    const raw = fs.readFileSync(path.join(SEED_DIR, file), "utf8");
    // First markdown H1 becomes the title; the rest is the body.
    const lines = raw.split("\n");
    let title = file.replace(/\.md$/, "");
    const headingIdx = lines.findIndex((l) => l.startsWith("# "));
    if (headingIdx !== -1) title = lines[headingIdx].replace(/^#\s+/, "").trim();
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

function loadStore() {
  if (fs.existsSync(STORE_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(STORE_PATH, "utf8"));
    } catch {
      // fall through to reseed if the file is corrupt
    }
  }
  const seeded = { entries: loadSeedEntries() };
  saveStore(seeded);
  return seeded;
}

function saveStore(store) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2));
}

let store = loadStore();

// ---------------------------------------------------------------------------
// Anthropic client + chat over the archive.
// The whole archive is fed to Claude as cached system context, and Claude is
// given tools to add / update / delete entries when you ask it to in chat.
// ---------------------------------------------------------------------------

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic()
  : null;

function archiveAsText() {
  if (store.entries.length === 0) return "(The archive is currently empty.)";
  return store.entries
    .map(
      (e) =>
        `<entry id="${e.id}" title="${e.title}" category="${e.category}">\n${e.content}\n</entry>`,
    )
    .join("\n\n");
}

const SYSTEM_INSTRUCTIONS = `You are the keeper of the Bennett Archive (the "Midnight Archive" project — Issue 001 is the Point Pleasant Mothman). You hold everything in the archive below and help the user explore it and keep it updated by chatting with you.

Behaviour:
- Answer questions using the archive content. Quote or reference specific entries when useful.
- If the answer isn't in the archive, say so plainly rather than inventing lore.
- When the user asks you to record, add, change, or remove something, use the provided tools. Confirm what you changed in one short sentence.
- Keep replies focused and conversational — this is a text chat, not a report.

--- ARCHIVE CONTENTS ---`;

const TOOLS = [
  {
    name: "add_entry",
    description:
      "Add a new entry to the archive. Use when the user wants to record new information, notes, or lore.",
    input_schema: {
      type: "object",
      properties: {
        title: { type: "string", description: "Short title for the entry" },
        category: {
          type: "string",
          description: "Optional grouping, e.g. 'Mothman' or 'Notes'",
        },
        content: { type: "string", description: "The full text of the entry" },
      },
      required: ["title", "content"],
    },
  },
  {
    name: "update_entry",
    description:
      "Update an existing entry by id. Only provided fields are changed.",
    input_schema: {
      type: "object",
      properties: {
        id: { type: "string", description: "The id of the entry to update" },
        title: { type: "string" },
        category: { type: "string" },
        content: { type: "string" },
      },
      required: ["id"],
    },
  },
  {
    name: "delete_entry",
    description: "Delete an entry from the archive by id.",
    input_schema: {
      type: "object",
      properties: {
        id: { type: "string", description: "The id of the entry to delete" },
      },
      required: ["id"],
    },
  },
];

function runTool(name, input) {
  if (name === "add_entry") {
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
    saveStore(store);
    return { ok: true, id: entry.id, message: `Added "${entry.title}".` };
  }
  if (name === "update_entry") {
    const entry = store.entries.find((e) => e.id === input.id);
    if (!entry) return { ok: false, message: `No entry with id ${input.id}.` };
    if (input.title !== undefined) entry.title = input.title;
    if (input.category !== undefined) entry.category = input.category;
    if (input.content !== undefined) entry.content = input.content;
    entry.updatedAt = nowIso();
    saveStore(store);
    return { ok: true, id: entry.id, message: `Updated "${entry.title}".` };
  }
  if (name === "delete_entry") {
    const idx = store.entries.findIndex((e) => e.id === input.id);
    if (idx === -1) return { ok: false, message: `No entry with id ${input.id}.` };
    const [removed] = store.entries.splice(idx, 1);
    saveStore(store);
    return { ok: true, message: `Deleted "${removed.title}".` };
  }
  return { ok: false, message: `Unknown tool ${name}.` };
}

async function chat(history) {
  if (!anthropic) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Add it to your environment (see .env.example) so the archive can chat.",
    );
  }

  // Rebuild the system block each call so it reflects the current archive.
  const system = [
    {
      type: "text",
      text: SYSTEM_INSTRUCTIONS,
    },
    {
      type: "text",
      text: archiveAsText(),
      cache_control: { type: "ephemeral" },
    },
  ];

  const messages = history.map((m) => ({ role: m.role, content: m.content }));

  // Manual agentic loop: let Claude call the archive tools until it's done.
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
      const toolResults = [];
      for (const block of response.content) {
        if (block.type === "tool_use") {
          const result = runTool(block.name, block.input);
          toolResults.push({
            type: "tool_result",
            tool_use_id: block.id,
            content: JSON.stringify(result),
          });
        }
      }
      messages.push({ role: "user", content: toolResults });
      continue;
    }

    // Done — collect the assistant's text.
    const text = response.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();
    return { reply: text || "(no reply)" };
  }
  return { reply: "I got stuck in a loop — please try rephrasing." };
}

// ---------------------------------------------------------------------------
// HTTP API
// ---------------------------------------------------------------------------

const app = express();
app.use(express.json({ limit: "2mb" }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, hasKey: Boolean(anthropic), entries: store.entries.length });
});

app.get("/api/entries", (_req, res) => {
  res.json(
    store.entries.map(({ id, title, category, source, updatedAt }) => ({
      id,
      title,
      category,
      source,
      updatedAt,
    })),
  );
});

app.get("/api/entries/:id", (req, res) => {
  const entry = store.entries.find((e) => e.id === req.params.id);
  if (!entry) return res.status(404).json({ error: "Not found" });
  res.json(entry);
});

app.post("/api/entries", (req, res) => {
  const { title, category, content } = req.body || {};
  if (!title || !content)
    return res.status(400).json({ error: "title and content are required" });
  const result = runTool("add_entry", { title, category, content });
  res.status(201).json(result);
});

app.put("/api/entries/:id", (req, res) => {
  const result = runTool("update_entry", { id: req.params.id, ...req.body });
  if (!result.ok) return res.status(404).json(result);
  res.json(result);
});

app.delete("/api/entries/:id", (req, res) => {
  const result = runTool("delete_entry", { id: req.params.id });
  if (!result.ok) return res.status(404).json(result);
  res.json(result);
});

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
  console.log(`Bennett Archive running on http://localhost:${PORT}`);
  console.log(`Model: ${MODEL} · Entries: ${store.entries.length} · API key: ${anthropic ? "set" : "MISSING"}`);
});
