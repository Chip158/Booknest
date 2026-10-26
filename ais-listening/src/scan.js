// Scan orchestration. A scan = one queue message per active topic, so each
// topic runs in its own short Worker invocation (fits the free plan limits).

import { LOOKBACK_DAYS } from '../config/settings.js';
import { rowToTopic, now } from './db.js';
import { runSources } from './sources/index.js';
import { applyRules } from './filter.js';
import { scoreCandidates } from './relevance.js';
import { canonicalUrl, domainOf, jaccard, sha, titleKey, truncate } from './text.js';

const CLUSTER_SIMILARITY = 0.55;

export async function runningScan(env) {
  return env.DB.prepare(
    "SELECT * FROM scans WHERE finished_at IS NULL AND started_at > strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-20 minutes') ORDER BY id DESC LIMIT 1"
  ).first();
}

export async function startScan(env, trigger) {
  const active = await runningScan(env);
  if (active) return { scan: active, alreadyRunning: true };

  const { results: topics } = await env.DB.prepare('SELECT id FROM topics WHERE paused = 0').all();
  const scan = await env.DB.prepare('INSERT INTO scans (trigger, started_at, topics_total) VALUES (?, ?, ?) RETURNING *')
    .bind(trigger, now(), topics.length)
    .first();
  if (!topics.length) {
    await env.DB.prepare('UPDATE scans SET finished_at = ? WHERE id = ?').bind(now(), scan.id).run();
    return { scan };
  }
  await env.SCAN_QUEUE.sendBatch(topics.map((t) => ({ body: { scanId: scan.id, topicId: t.id } })));
  return { scan };
}

async function finishTopic(env, scanId, topicId, stats) {
  await env.DB.batch([
    env.DB.prepare(
      'INSERT OR REPLACE INTO scan_runs (scan_id, topic_id, finished_at, fetched, excluded, no_context, duplicates, new_items, scorer, sources) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(scanId, topicId, now(), stats.fetched || 0, stats.excluded || 0, stats.no_context || 0, stats.duplicates || 0, stats.new_items || 0, stats.scorer || null, JSON.stringify(stats.sources || {})),
    env.DB.prepare(
      'UPDATE scans SET topics_done = topics_done + 1, new_items = new_items + ?, finished_at = CASE WHEN topics_done + 1 >= topics_total THEN ? ELSE finished_at END WHERE id = ?'
    ).bind(stats.new_items || 0, now(), scanId),
  ]);
}

// Learned from "Not relevant" clicks: recent dismissed headlines (shown to the
// relevance check as negative examples) and per-domain score penalties.
async function loadFeedback(env, topicId) {
  const { results: dismissed } = await env.DB.prepare(
    'SELECT title, domain FROM feedback WHERE topic_id = ? ORDER BY created_at DESC LIMIT 20'
  ).bind(topicId).all();
  const { results: domains } = await env.DB.prepare(
    `SELECT domain,
            SUM(CASE WHEN status = 'dismissed' THEN 1 ELSE 0 END) AS bad,
            SUM(CASE WHEN status = 'reviewed' OR starred = 1 THEN 1 ELSE 0 END) AS good
       FROM items WHERE topic_id = ? AND domain != '' GROUP BY domain HAVING bad >= 2`
  ).bind(topicId).all();
  const penalties = new Map();
  for (const d of domains) if (d.bad > d.good * 2) penalties.set(d.domain, Math.min(40, 10 * d.bad));
  return { dismissed, penalties };
}

export async function runTopicScan(env, { scanId, topicId }) {
  const row = await env.DB.prepare('SELECT * FROM topics WHERE id = ?').bind(topicId).first();
  if (!row || row.paused) return finishTopic(env, scanId, topicId, { sources: { skipped: 'paused or deleted' } });
  const topic = rowToTopic(row);

  const { n: existing } = await env.DB.prepare('SELECT COUNT(*) AS n FROM items WHERE topic_id = ?').bind(topicId).first();
  const days = existing ? LOOKBACK_DAYS.regular : LOOKBACK_DAYS.firstScan;

  const { candidates, report } = await runSources(topic, days, env);
  const stats = { fetched: candidates.length, excluded: 0, no_context: 0, duplicates: 0, new_items: 0, sources: report };

  // 1) Rules gate + exact-duplicate removal within this batch.
  const seen = new Set();
  const kept = [];
  for (const c of candidates) {
    const verdict = applyRules(topic, c);
    if (!verdict.ok) {
      if (verdict.reason === 'excluded') stats.excluded++;
      else stats.no_context++;
      continue;
    }
    c.canonical = canonicalUrl(c.url);
    c.domain = c.domain || domainOf(c.url);
    c.titleKey = titleKey(c.title);
    const dupKey = c.platform === 'Google News' ? `${c.titleKey}|${c.source}` : c.canonical;
    if (seen.has(dupKey) || seen.has(c.titleKey + '|' + c.domain)) {
      stats.duplicates++;
      continue;
    }
    seen.add(dupKey);
    seen.add(c.titleKey + '|' + c.domain);
    c._matched = verdict.matched;
    c.id = await sha(`${topicId}|${c.platform === 'Google News' ? dupKey : c.canonical}`);
    kept.push(c);
  }

  // 2) Drop anything already stored (from earlier scans).
  let fresh = kept;
  if (kept.length) {
    const ids = kept.map((c) => c.id);
    const known = new Set();
    for (let i = 0; i < ids.length; i += 90) {
      const chunk = ids.slice(i, i + 90);
      const { results } = await env.DB.prepare(`SELECT id FROM items WHERE id IN (${chunk.map(() => '?').join(',')})`).bind(...chunk).all();
      results.forEach((r) => known.add(r.id));
    }
    fresh = kept.filter((c) => !known.has(c.id));
    stats.duplicates += kept.length - fresh.length;
  }

  // 3) Same headline from another outlet → same story cluster (dedupe across outlets).
  const { results: recent } = await env.DB.prepare(
    "SELECT title_key, cluster_id FROM items WHERE topic_id = ? AND first_seen_at > strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-14 days')"
  ).bind(topicId).all();
  const pool = recent.map((r) => ({ key: r.title_key, cluster: r.cluster_id }));
  for (const c of fresh) {
    const match = pool.find((p) => jaccard(p.key, c.titleKey) >= CLUSTER_SIMILARITY);
    c.cluster_id = match ? match.cluster : c.id;
    pool.push({ key: c.titleKey, cluster: c.cluster_id });
  }

  // 4) Relevance + sentiment on every new result.
  if (fresh.length) {
    const feedback = await loadFeedback(env, topicId);
    stats.scorer = await scoreCandidates(env, topic, fresh, feedback);

    const ts = now();
    const stmt = env.DB.prepare(
      `INSERT OR IGNORE INTO items (id, topic_id, opco, url, title, title_key, source, domain, platform, source_type, published_at, snippet,
         sentiment, relevance, why, matched, scorer, cluster_id, scan_id, first_seen_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    await env.DB.batch(
      fresh.map((c) =>
        stmt.bind(
          c.id, topicId, topic.opco, c.url, truncate(c.title, 300), c.titleKey, truncate(c.source, 120), c.domain, c.platform, c.sourceType,
          c.publishedAt, truncate(c.snippet, 600), c.sentiment, c.relevance, c.why,
          JSON.stringify({ keywords: c._matched.keywords, context: c._matched.context, via: c._matched.via }),
          c.scorer, c.cluster_id, scanId, ts
        )
      )
    );
    stats.new_items = fresh.length;
  }

  await finishTopic(env, scanId, topicId, stats);
  return stats;
}
