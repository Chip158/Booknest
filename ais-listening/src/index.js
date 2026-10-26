import { BRAND, OPCOS, RELEVANCE_THRESHOLD, SCAN_HOURS_PACIFIC, TIMEZONE, RELEVANCE_MODEL } from '../config/settings.js';
import { handleLogin, handleLogout, sessionRole } from './auth.js';
import { ensureSeeded, insertTopicStmt, now, rowToItem, rowToTopic, validateTopic } from './db.js';
import { isScanSlot, nextScanTime } from './schedule.js';
import { runningScan, runTopicScan, startScan } from './scan.js';
import { enabledSources } from './sources/index.js';

const PUBLIC_PATHS = new Set(['/login.html', '/styles.css', '/favicon.svg', '/login.js', '/api/login']);

const SECURITY_HEADERS = {
  'Content-Security-Policy':
    "default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
  'Strict-Transport-Security': 'max-age=31536000',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

function secure(res) {
  const out = new Response(res.body, res);
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) out.headers.set(k, v);
  return out;
}

const json = (data, status = 200) => Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

async function body(request) {
  try {
    return await request.json();
  } catch {
    throw new HttpError(400, 'Invalid JSON');
  }
}

// ------------------------------------------------------------------ API

async function api(request, env, path, role) {
  const method = request.method;

  // Mutations must be same-origin JSON requests (CSRF protection on top of SameSite cookies).
  if (method !== 'GET') {
    const origin = request.headers.get('Origin');
    if (origin && origin !== new URL(request.url).origin) throw new HttpError(403, 'Bad origin');
    if (!(request.headers.get('Content-Type') || '').includes('application/json')) throw new HttpError(415, 'JSON required');
    if (role !== 'editor') throw new HttpError(403, 'View-only access: ask the team to make changes.');
  }

  if (path === '/api/config' && method === 'GET') {
    return json({
      brand: BRAND,
      opcos: OPCOS,
      threshold: RELEVANCE_THRESHOLD,
      scanHours: SCAN_HOURS_PACIFIC,
      role,
      timezone: TIMEZONE,
      scorer: env.ANTHROPIC_API_KEY ? `Claude (${RELEVANCE_MODEL})` : 'Rules only — add ANTHROPIC_API_KEY for Claude scoring',
      sources: enabledSources(env).map(([name]) => name),
    });
  }

  if (path === '/api/status' && method === 'GET') {
    const last = await env.DB.prepare('SELECT * FROM scans WHERE finished_at IS NOT NULL ORDER BY id DESC LIMIT 1').first();
    return json({ running: await runningScan(env), last, next: nextScanTime(), serverTime: now() });
  }

  if (path === '/api/items' && method === 'GET') {
    const days = Math.min(365, Math.max(1, Number(new URL(request.url).searchParams.get('days')) || 30));
    const { results } = await env.DB.prepare(
      `SELECT * FROM items WHERE first_seen_at > strftime('%Y-%m-%dT%H:%M:%fZ', 'now', ?) ORDER BY first_seen_at DESC LIMIT 3000`
    ).bind(`-${days} days`).all();
    return json({ items: results.map(rowToItem) });
  }

  const itemMatch = path.match(/^\/api\/items\/([a-f0-9]{8,64})$/);
  if (itemMatch && method === 'POST') {
    const { action } = await body(request);
    const id = itemMatch[1];
    const item = await env.DB.prepare('SELECT * FROM items WHERE id = ?').bind(id).first();
    if (!item) throw new HttpError(404, 'Not found');
    const ts = now();
    const stmts = [];
    // Apply to the whole story cluster so every outlet's copy moves together.
    const cluster = (sql, ...args) => env.DB.prepare(`${sql}, updated_at = ? WHERE cluster_id = ?`).bind(...args, ts, item.cluster_id);
    if (action === 'reviewed') stmts.push(cluster("UPDATE items SET status = 'reviewed'"));
    else if (action === 'reopen') stmts.push(cluster("UPDATE items SET status = 'open'"), env.DB.prepare('DELETE FROM feedback WHERE item_id = ?').bind(id));
    else if (action === 'star') stmts.push(cluster('UPDATE items SET starred = 1'));
    else if (action === 'unstar') stmts.push(cluster('UPDATE items SET starred = 0'));
    else if (action === 'dismissed') {
      stmts.push(cluster("UPDATE items SET status = 'dismissed', starred = 0"));
      stmts.push(env.DB.prepare('INSERT INTO feedback (topic_id, item_id, title, domain, created_at) VALUES (?, ?, ?, ?, ?)').bind(item.topic_id, id, item.title, item.domain, ts));
    } else throw new HttpError(400, 'Unknown action');
    await env.DB.batch(stmts);
    return json({ ok: true });
  }

  if (path === '/api/topics' && method === 'GET') {
    const { results } = await env.DB.prepare("SELECT * FROM topics ORDER BY opco, CASE type WHEN 'opco' THEN 0 WHEN 'project' THEN 1 ELSE 2 END, name").all();
    return json({ topics: results.map(rowToTopic) });
  }

  if (path === '/api/topics' && method === 'POST') {
    let t;
    try {
      t = validateTopic(await body(request));
    } catch (e) {
      throw new HttpError(400, e.message);
    }
    await insertTopicStmt(env, t).run();
    return json({ ok: true });
  }

  const topicMatch = path.match(/^\/api\/topics\/(\d+)$/);
  if (topicMatch && method === 'PUT') {
    let t;
    try {
      t = validateTopic(await body(request));
    } catch (e) {
      throw new HttpError(400, e.message);
    }
    await env.DB.prepare(
      'UPDATE topics SET name = ?, opco = ?, type = ?, keywords = ?, context = ?, exclude = ?, confirm = ?, paused = ?, updated_at = ? WHERE id = ?'
    ).bind(t.name, t.opco, t.type, JSON.stringify(t.keywords), JSON.stringify(t.context), JSON.stringify(t.exclude), JSON.stringify(t.confirm), t.paused ? 1 : 0, now(), Number(topicMatch[1])).run();
    return json({ ok: true });
  }

  if (topicMatch && method === 'DELETE') {
    // Results are kept for history; the topic simply stops being scanned.
    await env.DB.prepare('DELETE FROM topics WHERE id = ?').bind(Number(topicMatch[1])).run();
    return json({ ok: true });
  }

  if (path === '/api/scan' && method === 'POST') {
    const { scan, alreadyRunning } = await startScan(env, 'manual');
    return json({ scan, alreadyRunning: !!alreadyRunning });
  }

  if (path === '/api/scans' && method === 'GET') {
    const { results: scans } = await env.DB.prepare('SELECT * FROM scans ORDER BY id DESC LIMIT 14').all();
    const last = scans.find((s) => s.finished_at) || scans[0];
    const { results: runs } = last
      ? await env.DB.prepare('SELECT r.*, t.name AS topic_name FROM scan_runs r LEFT JOIN topics t ON t.id = r.topic_id WHERE r.scan_id = ? ORDER BY t.name').bind(last.id).all()
      : { results: [] };
    return json({ scans, runs: runs.map((r) => ({ ...r, sources: JSON.parse(r.sources || '{}') })) });
  }

  if (path === '/api/trends' && method === 'GET') {
    const { results } = await env.DB.prepare(
      `SELECT substr(COALESCE(published_at, first_seen_at), 1, 10) AS day, opco, sentiment, COUNT(*) AS n
         FROM items
        WHERE COALESCE(published_at, first_seen_at) > strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-90 days') AND status != 'dismissed' AND relevance >= ?
        GROUP BY day, opco, sentiment ORDER BY day`
    ).bind(RELEVANCE_THRESHOLD).all();
    return json({ rows: results });
  }

  throw new HttpError(404, 'Not found');
}

// ------------------------------------------------------------- entry points

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    try {
      if (path === '/api/login' && request.method === 'POST') return secure(await handleLogin(request, env));
      if (path === '/logout') return secure(handleLogout(request));
      if (PUBLIC_PATHS.has(path)) return secure(await env.ASSETS.fetch(request));

      const role = await sessionRole(request, env);
      if (!role) {
        if (path.startsWith('/api/')) return secure(json({ error: 'Not signed in' }, 401));
        return secure(Response.redirect(new URL('/login.html', url).toString(), 302));
      }

      await ensureSeeded(env);
      if (path.startsWith('/api/')) return secure(await api(request, env, path, role));
      const assetUrl = new URL(path === '/' ? '/index.html' : path, url);
      const res = await env.ASSETS.fetch(new Request(assetUrl, request));
      const out = secure(res);
      out.headers.set('Cache-Control', 'no-cache');
      return out;
    } catch (err) {
      const status = err instanceof HttpError ? err.status : 500;
      if (status === 500) console.error(err);
      return secure(json({ error: err.message || 'Server error' }, status));
    }
  },

  // Runs every hour (see wrangler.toml); only scans at the configured Pacific hours.
  async scheduled(event, env, ctx) {
    if (!isScanSlot(new Date(event.scheduledTime))) return;
    await ensureSeeded(env);
    ctx.waitUntil(startScan(env, 'scheduled'));
  },

  // One message per topic per scan.
  async queue(batch, env) {
    for (const msg of batch.messages) {
      try {
        await runTopicScan(env, msg.body);
        msg.ack();
      } catch (err) {
        console.error('topic scan failed', msg.body, err);
        if (msg.attempts >= 2) {
          await env.DB.prepare(
            'UPDATE scans SET topics_done = topics_done + 1, finished_at = CASE WHEN topics_done + 1 >= topics_total THEN ? ELSE finished_at END WHERE id = ?'
          ).bind(now(), msg.body.scanId).run();
          msg.ack();
        } else msg.retry();
      }
    }
  },
};
