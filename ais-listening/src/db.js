import { SEED_TOPICS } from '../config/seed-topics.js';

const JSON_FIELDS = ['keywords', 'context', 'exclude', 'confirm'];

export function rowToTopic(r) {
  const t = { ...r, paused: !!r.paused };
  for (const f of JSON_FIELDS) t[f] = JSON.parse(r[f] || '[]');
  return t;
}

export function rowToItem(r) {
  return {
    ...r,
    starred: !!r.starred,
    matched: JSON.parse(r.matched || '{}'),
    names_found: JSON.parse(r.names_found || '[]'),
    images: JSON.parse(r.images || '[]'),
  };
}

export const now = () => new Date().toISOString();

let seeded = false;
export async function ensureSeeded(env) {
  if (seeded) return;
  const { n } = await env.DB.prepare('SELECT COUNT(*) AS n FROM topics').first();
  if (n === 0) {
    await env.DB.batch(SEED_TOPICS.map((t) => insertTopicStmt(env, t)));
  }
  seeded = true;
}

const clean = (list) => [...new Set((Array.isArray(list) ? list : String(list || '').split(/[\n,]/)).map((s) => String(s).trim()).filter(Boolean))].slice(0, 60);

export function validateTopic(input) {
  const t = {
    name: String(input.name || '').trim().slice(0, 120),
    opco: String(input.opco || '').trim().slice(0, 20),
    type: ['opco', 'project', 'location'].includes(input.type) ? input.type : 'project',
    keywords: clean(input.keywords),
    context: clean(input.context),
    exclude: clean(input.exclude),
    confirm: clean(input.confirm),
    paused: !!input.paused,
  };
  if (!t.name) throw new Error('Name is required');
  if (!t.opco) throw new Error('OpCo is required');
  if (!t.keywords.length) throw new Error('At least one keyword is required');
  return t;
}

export function insertTopicStmt(env, t) {
  return env.DB.prepare(
    'INSERT INTO topics (name, opco, type, keywords, context, exclude, confirm, paused) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(t.name, t.opco, t.type, JSON.stringify(t.keywords), JSON.stringify(t.context), JSON.stringify(t.exclude || []), JSON.stringify(t.confirm || []), t.paused ? 1 : 0);
}
