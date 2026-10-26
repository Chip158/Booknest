// AIS Social Listening dashboard. Plain JS, no build step.
// All text from the web is inserted with textContent (never innerHTML).
'use strict';

const $ = (id) => document.getElementById(id);
const SENTIMENTS = [
  { key: 'negative', label: 'Negative', icon: '▼' },
  { key: 'neutral', label: 'Neutral', icon: '●' },
  { key: 'positive', label: 'Positive', icon: '▲' },
];
const SENT_COLORS = { negative: '#C62828', neutral: '#8A96A3', positive: '#2E7D32' };
const PAGE = 40;

const state = {
  config: null,
  items: [],
  topics: [],
  status: null,
  trends: [],
  lastScanId: null,
  prevSeen: 0,
  shown: PAGE,
  editing: null, // topic id being edited, or 'new'
  f: { opco: 'ALL', topic: 'ALL', sentiment: 'ALL', range: '7', sort: 'priority', q: '', exp: 'ALL', low: false, handled: false, starred: false, onlyNew: false },
};

// ------------------------------------------------------------------ helpers

function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'text') el.textContent = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k.startsWith('--')) el.style.setProperty(k, v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const c of children.flat()) if (c != null && c !== false) el.append(c.nodeType ? c : document.createTextNode(String(c)));
  return el;
}

function safeUrl(u) {
  try {
    const url = new URL(u);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null;
  } catch {
    return null;
  }
}

async function api(path, opts = {}) {
  const res = await fetch(path, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  if (res.status === 401) {
    location.href = '/login.html';
    throw new Error('Signed out');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

const opcoOf = (code) => state.config.opcos.find((o) => o.code === code) || { code, name: code, color: '#A7B1BC' };
const topicOf = (id) => state.topics.find((t) => t.id === id);
// What the team watches for first: one of our companies named in the copy, or
// our logo / branded equipment in a photo.
const isUs = (it) => it.exposure === 'named' || it.exposure === 'pictured';
// …plus a photo that might show our logo/equipment: a person should look.
const mayBeUs = (it) => isUs(it) || it.photo === 'unclear';
// View-only sign-ins see everything but get no controls that change data.
const canEdit = () => state.config?.role === 'editor';

// Readable text on any brand color.
function onColor(hex) {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.4 ? '#1D2733' : '#FFFFFF';
}

function when(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 0) {
    const today = new Date().toDateString() === d.toDateString();
    return (today ? 'today ' : d.toLocaleDateString(undefined, { weekday: 'short' }) + ' ') + d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  }
  if (diff < 3600) return `${Math.max(1, Math.round(diff / 60))} min ago`;
  if (diff < 86400) return `${Math.round(diff / 3600)} h ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: d.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined });
}

const fullTime = (iso) => (iso ? new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '');

// ------------------------------------------------------- "new since last check"

function loadSeen() {
  try {
    state.prevSeen = Number(localStorage.getItem('ais.lastSeen')) || Date.now() - 86400000;
  } catch {
    state.prevSeen = Date.now() - 86400000;
  }
}
function saveSeen() {
  try {
    localStorage.setItem('ais.lastSeen', String(Date.now()));
  } catch {}
}
const isNew = (it) => new Date(it.first_seen_at).getTime() > state.prevSeen;

// ------------------------------------------------------------------ filters

function readHash() {
  const p = new URLSearchParams(location.hash.slice(1));
  for (const k of Object.keys(state.f)) {
    if (!p.has(k)) continue;
    const v = p.get(k);
    state.f[k] = typeof state.f[k] === 'boolean' ? v === '1' : v;
  }
}
function writeHash() {
  const p = new URLSearchParams();
  const d = { opco: 'ALL', topic: 'ALL', sentiment: 'ALL', range: '7', sort: 'priority', q: '', exp: 'ALL' };
  for (const [k, v] of Object.entries(state.f)) {
    if (typeof v === 'boolean') v && p.set(k, '1');
    else if (v !== d[k]) p.set(k, v);
  }
  history.replaceState(null, '', p.toString() ? `#${p}` : location.pathname);
}
function setFilter(patch) {
  Object.assign(state.f, patch);
  state.shown = PAGE;
  writeHash();
  render();
}

// Applies every filter except the ones named in `skip` (used for chip counts).
function filtered(skip = []) {
  const f = state.f;
  const since = Date.now() - Number(f.range) * 86400000;
  const q = f.q.trim().toLowerCase();
  return state.items.filter((it) => {
    if (it.exposure === 'pending') return false; // still being checked
    if (new Date(it.published_at || it.first_seen_at).getTime() < since) return false;
    if (!skip.includes('exp') && f.exp === 'us' && !isUs(it)) return false;
    if (!skip.includes('exp') && f.exp === 'not' && isUs(it)) return false;
    if (!skip.includes('opco') && f.opco !== 'ALL' && it.opco !== f.opco) return false;
    if (!skip.includes('topic') && f.topic !== 'ALL' && String(it.topic_id) !== f.topic) return false;
    if (!skip.includes('sentiment') && f.sentiment !== 'ALL' && it.sentiment !== f.sentiment) return false;
    if (!f.low && it.relevance < state.config.threshold && !it.starred) return false;
    if (!f.handled && it.status !== 'open' && !it.starred) return false;
    if (f.starred && !it.starred) return false;
    if (f.onlyNew && !isNew(it)) return false;
    if (q && !`${it.title} ${it.source} ${it.snippet}`.toLowerCase().includes(q)) return false;
    return true;
  });
}

// A story = one cluster (same headline across outlets), also joined across
// topics when the same article matched two projects (e.g. Cabeza Prieta and
// Las Playas Intaglio). Rebuilt whenever items load.
let storyMap = new Map();
function buildStories() {
  storyMap = new Map();
  const byUrl = new Map();
  const alias = new Map();
  for (const it of state.items) {
    const url = it.article_url || it.url;
    const root = alias.get(it.cluster_id) || byUrl.get(url) || it.cluster_id;
    alias.set(it.cluster_id, root);
    if (!byUrl.has(url)) byUrl.set(url, root);
  }
  for (const it of state.items) storyMap.set(it.id, alias.get(it.cluster_id));
}
const storyOf = (it) => storyMap.get(it.id) || it.cluster_id;

// One card per story: copies of the same story from other outlets are grouped.
function clusters(items) {
  const all = new Map();
  for (const it of state.items) {
    if (!all.has(storyOf(it))) all.set(storyOf(it), []);
    all.get(storyOf(it)).push(it);
  }
  const seen = new Set();
  const out = [];
  for (const it of items) {
    if (seen.has(storyOf(it))) continue;
    seen.add(storyOf(it));
    const group = all.get(storyOf(it)).filter((x) => x.status !== 'dismissed' || it.status === 'dismissed');
    const visible = items.filter((x) => storyOf(x) === storyOf(it));
    const lead = visible.sort((a, b) => b.relevance - a.relevance || a.first_seen_at.localeCompare(b.first_seen_at))[0];
    out.push({ lead, others: group.filter((x) => x.id !== lead.id) });
  }
  const date = (g) => g.lead.published_at || g.lead.first_seen_at;
  const sorters = {
    // Stories that name or show us first; then relevance tier; newest first
    // within a tier, so a strong match from today isn't buried under a
    // slightly higher score from weeks ago.
    priority: (a, b) =>
      groupOf(b.lead).rank - groupOf(a.lead).rank ||
      tierOf(b.lead.relevance).rank - tierOf(a.lead.relevance).rank ||
      date(b).localeCompare(date(a)),
    newest: (a, b) => (b.lead.published_at || b.lead.first_seen_at).localeCompare(a.lead.published_at || a.lead.first_seen_at),
    oldest: (a, b) => (a.lead.published_at || a.lead.first_seen_at).localeCompare(b.lead.published_at || b.lead.first_seen_at),
    relevance: (a, b) => b.lead.relevance - a.lead.relevance || date(b).localeCompare(date(a)),
  };
  return out.sort(sorters[state.f.sort] || sorters.priority);
}

function tierOf(score) {
  const t = state.config.threshold;
  if (score >= 90) return { rank: 3, label: 'Highly relevant · 90+' };
  if (score >= 75) return { rank: 2, label: 'Likely relevant · 75–89' };
  if (score >= t) return { rank: 1, label: `Possibly relevant · ${t}–74` };
  return { rank: 0, label: `Low confidence · below ${t}` };
}

function groupOf(it) {
  if (it.relevance < state.config.threshold) return { rank: 0, label: `Low confidence · relevance below ${state.config.threshold}` };
  if (mayBeUs(it)) return { rank: 2, label: 'Names us or may show us in a photo' };
  return { rank: 1, label: "Our topics in the news · we're not named or pictured" };
}

// Cards, with a heading wherever the group changes (priority sort only).
function cardsWithGroups(groups) {
  if (state.f.sort !== 'priority') return groups.map(card);
  const out = [];
  let last = null;
  for (const g of groups) {
    const grp = groupOf(g.lead);
    if (grp.rank !== last) out.push(h('h3', { class: `tier tier-${grp.rank}`, text: grp.label }));
    last = grp.rank;
    out.push(card(g));
  }
  return out;
}

// ------------------------------------------------------------------ actions

async function act(item, action) {
  try {
    await api(`/api/items/${item.id}`, { method: 'POST', body: { action } });
    for (const it of state.items) {
      if (it.cluster_id !== item.cluster_id) continue;
      if (action === 'reviewed') it.status = 'reviewed';
      if (action === 'dismissed') Object.assign(it, { status: 'dismissed', starred: false });
      if (action === 'reopen') it.status = 'open';
      if (action === 'star') it.starred = true;
      if (action === 'unstar') it.starred = false;
    }
    render();
  } catch (e) {
    alert(e.message);
  }
}

async function checkNow() {
  const btn = $('check-now');
  btn.disabled = true;
  try {
    const { alreadyRunning } = await api('/api/scan', { method: 'POST', body: {} });
    if (alreadyRunning) btn.textContent = 'Scan running…';
    await refreshStatus();
  } catch (e) {
    alert(e.message);
    btn.disabled = false;
  }
}

// ------------------------------------------------------------------ render

function renderStatus() {
  const s = state.status;
  const el = $('scan-status');
  el.replaceChildren();
  const btn = $('check-now');
  if (s.running) {
    btn.disabled = true;
    btn.textContent = 'Scanning…';
    el.append(h('strong', { text: `Scanning: ${s.running.topics_done} of ${s.running.topics_total} topics done` }), ' · results appear automatically');
  } else if (s.checking) {
    btn.disabled = true;
    btn.textContent = 'Checking…';
    el.append(h('strong', { text: `Reading ${s.checking} new stor${s.checking === 1 ? 'y' : 'ies'} for our names and logos` }), ' · results appear as they finish');
  } else {
    btn.disabled = false;
    btn.textContent = 'Check now';
    el.append(
      'Last scan ',
      h('strong', { text: s.last ? `${when(s.last.finished_at)}` : 'never', title: s.last ? fullTime(s.last.finished_at) : '' }),
      s.last ? ` (${s.last.new_items} new)` : '',
      ' · Next ',
      h('strong', { text: s.next ? when(s.next) : '—', title: fullTime(s.next) })
    );
  }
}

function renderTiles() {
  const base = filtered(['sentiment']).filter((it) => it.status !== 'dismissed');
  // Count stories, not outlet copies, so tiles match the lists below.
  const stories = (list) => new Set(list.map(storyOf)).size;
  const us = stories(base.filter(isUs));
  const neg = stories(base.filter((it) => isUs(it) && it.sentiment === 'negative' && it.status === 'open'));
  const pos = stories(base.filter((it) => isUs(it) && it.sentiment === 'positive'));
  const fresh = stories(base.filter((it) => isUs(it) && isNew(it)));
  const tile = (cls, num, lbl, onclick) => h('button', { class: `tile ${cls}`, type: 'button', onclick }, h('div', { class: 'num', text: num }), h('div', { class: 'lbl', text: lbl }));
  $('tiles').replaceChildren(
    tile('us', us, 'Name us or show our logo', () => { setFilter({ exp: 'us', sentiment: 'ALL' }); $('h-results').scrollIntoView({ behavior: 'smooth' }); }),
    tile('neg', neg, 'Negative about us, not reviewed', () => { $('h-attention').scrollIntoView({ behavior: 'smooth' }); }),
    tile('pos', pos, 'Positive about us — share-worthy', () => { setFilter({ exp: 'us', sentiment: 'positive' }); $('h-results').scrollIntoView({ behavior: 'smooth' }); }),
    tile('new', fresh, 'New about us since your last visit', () => { setFilter({ exp: 'us', onlyNew: true }); $('h-results').scrollIntoView({ behavior: 'smooth' }); })
  );
}

function renderFilters() {
  const f = state.f;
  const countBase = filtered(['opco', 'topic']);
  const chip = (label, pressed, onclick, color, n) =>
    h('button', { class: 'chip', type: 'button', 'aria-pressed': String(pressed), onclick, '--c': color },
      color ? h('span', { class: 'dot' }) : null, label, n != null ? h('span', { class: 'n', text: n }) : null);

  $('opco-chips').replaceChildren(
    chip('All', f.opco === 'ALL', () => setFilter({ opco: 'ALL', topic: 'ALL' }), null, countBase.length),
    ...state.config.opcos
      .filter((o) => state.topics.some((t) => t.opco === o.code) || state.items.some((i) => i.opco === o.code))
      .map((o) => chip(o.name, f.opco === o.code, () => setFilter({ opco: o.code, topic: 'ALL' }), o.color, countBase.filter((i) => i.opco === o.code).length))
  );

  const eBase = filtered(['exp']);
  $('exp-chips').replaceChildren(
    chip('All', f.exp === 'ALL', () => setFilter({ exp: 'ALL' }), null, eBase.length),
    chip('Names or shows us', f.exp === 'us', () => setFilter({ exp: 'us' }), null, eBase.filter(isUs).length),
    chip('Not named or pictured', f.exp === 'not', () => setFilter({ exp: 'not' }), null, eBase.filter((i) => !isUs(i)).length)
  );

  const sBase = filtered(['sentiment']);
  $('sentiment-chips').replaceChildren(
    chip('All', f.sentiment === 'ALL', () => setFilter({ sentiment: 'ALL' })),
    ...SENTIMENTS.map((s) => chip(`${s.icon} ${s.label}`, f.sentiment === s.key, () => setFilter({ sentiment: s.key }), null, sBase.filter((i) => i.sentiment === s.key).length))
  );

  const sel = $('f-topic');
  const topics = state.topics.filter((t) => f.opco === 'ALL' || t.opco === f.opco);
  sel.replaceChildren(h('option', { value: 'ALL', text: f.opco === 'ALL' ? 'All projects & topics' : `All ${opcoOf(f.opco).name} topics` }),
    ...topics.map((t) => h('option', { value: String(t.id), text: `${t.name}${t.paused ? ' (paused)' : ''}` })));
  sel.value = topics.some((t) => String(t.id) === f.topic) ? f.topic : 'ALL';
  $('f-range').value = f.range;
  $('f-sort').value = f.sort;
  if (document.activeElement !== $('f-q')) $('f-q').value = f.q;
  $('f-low').checked = f.low;
  $('f-handled').checked = f.handled;
  $('f-starred').checked = f.starred;
  $('f-new').checked = f.onlyNew;
}

function renderOpcoView() {
  const sec = $('opco-section');
  if (state.f.opco === 'ALL') {
    sec.hidden = true;
    return;
  }
  sec.hidden = false;
  const o = opcoOf(state.f.opco);
  const base = filtered(['topic', 'sentiment']);
  const topics = state.topics.filter((t) => t.opco === o.code);
  const view = $('opco-view');
  view.style.setProperty('--c', o.color);
  view.replaceChildren(
    h('h2', {}, h('span', { class: 'tag', '--c': o.color, text: o.code }), `${o.name} — all projects`),
    h('div', { class: 'project-grid' },
      ...topics.map((t) => {
        const its = base.filter((i) => i.topic_id === t.id);
        const n = (s) => its.filter((i) => i.sentiment === s).length;
        return h('button', { class: 'project-btn', type: 'button', 'aria-pressed': String(state.f.topic === String(t.id)), onclick: () => setFilter({ topic: state.f.topic === String(t.id) ? 'ALL' : String(t.id) }) },
          h('div', { text: `${t.name}${t.paused ? ' (paused)' : ''}` }),
          h('div', { class: 'counts', text: `${its.length} results · ▼ ${n('negative')} negative · ▲ ${n('positive')} positive` }));
      }))
  );
}

function card(group) {
  const it = group.lead;
  const o = opcoOf(it.opco);
  const t = topicOf(it.topic_id);
  const url = safeUrl(it.article_url || it.url);
  const low = it.relevance < state.config.threshold;
  const handled = it.status !== 'open';
  const sent = SENTIMENTS.find((s) => s.key === it.sentiment) || SENTIMENTS[1];
  const date = it.published_at || it.first_seen_at;

  const others = group.others.filter((x) => safeUrl(x.url));
  return h('article', { class: `card ${it.sentiment === 'negative' && !handled ? 'is-negative' : ''} ${handled ? 'is-handled' : ''}`, '--c': o.color },
    h('div', { class: 'card-meta' },
      h('span', { class: 'tag', '--c': o.color, '--on-c': onColor(o.color), text: o.code, title: o.name }),
      h('span', { class: 'topic-name', text: t ? t.name : 'Removed topic' }),
      isNew(it) ? h('span', { class: 'badge-new', text: 'NEW' }) : null,
      it.status === 'reviewed' ? h('span', { class: 'badge-state', text: 'Reviewed' }) : null,
      it.status === 'dismissed' ? h('span', { class: 'badge-state', text: 'Dismissed' }) : null,
      it.starred ? h('span', { class: 'badge-state', text: '★ Starred' }) : null),
    h('h3', {}, url ? h('a', { href: url, target: '_blank', rel: 'noopener noreferrer', text: it.title }) : it.title),
    h('div', { class: 'src', text: [it.source, it.platform, `${when(date)}`].filter(Boolean).join(' · '), title: `Published ${fullTime(it.published_at) || 'unknown'} · found ${fullTime(it.first_seen_at)}` }),
    exposureLine(it),
    photoStrip(it, url),
    it.snippet ? h('p', { class: 'snippet', text: it.snippet }) : null,
    h('div', { class: 'scores' },
      h('span', { class: `pill ${sent.key}`, text: `${sent.icon} ${sent.label}` }),
      h('span', { class: `rel ${low ? 'low' : ''}`, title: 'Relevance score 0–100' },
        `Relevance ${it.relevance}`,
        h('span', { class: 'rel-bar' }, h('span'))),
      low ? h('span', { class: 'badge-state', text: 'Low confidence' }) : null),
    h('p', { class: 'why' }, h('b', { text: 'Why it matched: ' }), it.why || '',
      it.scorer === 'claude' && (it.matched?.keywords?.length || it.matched?.context?.length)
        ? ` Matched: ${[...(it.matched.keywords || []), ...(it.matched.context || [])].join(', ')}.`
        : ''),
    others.length
      ? h('p', { class: 'also' }, `Also covered by ${others.length} more: `,
          ...others.slice(0, 8).map((x) => h('a', { href: safeUrl(x.url), target: '_blank', rel: 'noopener noreferrer', text: x.source || x.domain || x.platform })),
          others.length > 8 ? `+${others.length - 8}` : '')
      : null,
    canEdit() && h('div', { class: 'actions' },
      h('button', { class: 'btn', type: 'button', 'aria-pressed': String(it.status === 'reviewed'), onclick: () => act(it, it.status === 'reviewed' ? 'reopen' : 'reviewed') }, '✓ Reviewed'),
      h('button', { class: 'btn', type: 'button', 'aria-pressed': String(it.status === 'dismissed'), onclick: () => act(it, it.status === 'dismissed' ? 'reopen' : 'dismissed'), title: 'Not about us — teaches the filter' }, it.status === 'dismissed' ? '↺ Restore' : '✕ Not relevant'),
      h('button', { class: 'btn', type: 'button', 'aria-pressed': String(it.starred), onclick: () => act(it, it.starred ? 'unstar' : 'star') }, it.starred ? '★ Starred' : '☆ Star'))
  );
}

// The most important line on a card: are we named, or in a photo?
function exposureLine(it) {
  const names = it.names_found || [];
  const parts = [];
  if (it.exposure === 'named') parts.push(h('span', { class: 'exp us', text: `Names us: ${names.join(', ') || 'yes'}` }));
  if (it.photo === 'yes') parts.push(h('span', { class: 'exp us', text: 'Our logo in a photo' }));
  if (it.photo === 'unclear') parts.push(h('span', { class: 'exp maybe', text: 'Photo may show us — please look' }));
  if (!parts.length) parts.push(h('span', { class: 'exp safe', text: 'Not named or pictured' }));
  if (it.photo === 'unchecked' && it.images?.length) parts.push(h('span', { class: 'exp note', text: 'Photos not checked' }));
  if (it.source_type === 'news' && !it.text_checked) parts.push(h('span', { class: 'exp note', text: 'Headline only' }));
  return h('div', { class: 'exposure' }, parts,
    it.mention_where ? h('p', { class: 'mention' }, h('b', { text: `Where: ${it.mention_where}` }), it.mention_quote && it.mention_where !== 'Headline' ? ` · “${it.mention_quote}”` : '') : null,
    it.photo_note ? h('p', { class: 'photo-note', text: it.photo_note }) : null);
}

// ------------------------------------------------------------------ weekly

// Monday (Pacific) of the week a story was published, as YYYY-MM-DD.
function weekOf(iso) {
  const local = new Date(new Date(iso).toLocaleString('en-US', { timeZone: state.config.timezone }));
  local.setDate(local.getDate() - ((local.getDay() + 6) % 7));
  return `${local.getFullYear()}-${String(local.getMonth() + 1).padStart(2, '0')}-${String(local.getDate()).padStart(2, '0')}`;
}

// Week-by-week summary of the current filters (OpCo, project, who's in it…),
// with a CSV per week and for the month.
function renderWeekly() {
  const items = filtered(['sentiment']).filter((it) => it.status !== 'dismissed');
  const weeks = new Map();
  for (const it of items) {
    const w = weekOf(it.published_at || it.first_seen_at);
    if (!weeks.has(w)) weeks.set(w, []);
    weeks.get(w).push(it);
  }
  const stories = (list) => new Set(list.map(storyOf)).size;
  const label = (w) => `Week of ${new Date(`${w}T12:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
  const scope = state.f.opco === 'ALL' ? 'all companies' : opcoOf(state.f.opco).name;
  const rows = [...weeks.keys()].sort().reverse().map((w) => {
    const list = weeks.get(w);
    const n = (fn) => stories(list.filter(fn));
    const opcos = [...new Set(list.filter(isUs).map((it) => opcoOf(it.opco).code))];
    return h('tr', {},
      h('th', { scope: 'row', text: label(w) }),
      h('td', { text: stories(list) }),
      h('td', { text: n(isUs) }),
      h('td', { class: 'neg-n', text: n((it) => it.sentiment === 'negative') }),
      h('td', { class: 'pos-n', text: n((it) => it.sentiment === 'positive') }),
      h('td', { class: 'opcos', text: opcos.join(', ') || '—' }),
      h('td', {}, h('a', { href: `/api/export.csv?week=${w}`, class: 'csv' }, 'CSV')));
  });
  $('weekly-scope').textContent = `· ${scope}, last ${state.f.range} days`;
  $('weekly').replaceChildren(rows.length
    ? h('div', { class: 'table-wrap' }, h('table', { class: 'weekly' },
        h('thead', {}, h('tr', {}, ['Week', 'Stories', 'Name/show us', 'Negative', 'Positive', 'OpCos named', 'Export'].map((c) => h('th', { scope: 'col', text: c })))),
        h('tbody', {}, rows)))
    : h('div', { class: 'empty', text: 'No stories for these filters yet.' }));
  $('export-month').href = `/api/export.csv?days=${Math.max(30, Number(state.f.range))}`;
}

// Lead photo, so a logo or our equipment can be spotted at a glance.
function photoStrip(it, url) {
  const src = (it.images || []).map(safeUrl).find(Boolean);
  if (!src) return null;
  const img = h('img', { src, alt: 'Photo from the article', loading: 'lazy', referrerpolicy: 'no-referrer', class: 'thumb' });
  img.addEventListener('error', () => img.closest('.thumb-wrap')?.remove());
  return h('a', { class: 'thumb-wrap', href: url || src, target: '_blank', rel: 'noopener noreferrer' }, img);
}

function setBarWidths(root) {
  // CSP forbids inline style attributes, so widths are set through the CSSOM.
  root.querySelectorAll('.rel-bar > span').forEach((el) => {
    const n = Number(el.closest('.rel').textContent.match(/\d+/)?.[0] || 0);
    el.style.width = `${n}%`;
  });
}

function renderLists() {
  const items = filtered();
  const groups = clusters(items);
  // Needs attention = negative AND we're named, pictured, or possibly pictured.
  const attention = groups.filter((g) => mayBeUs(g.lead) && g.lead.sentiment === 'negative' && g.lead.status === 'open');
  const rest = groups.filter((g) => !attention.includes(g));

  $('attention-count').textContent = `· ${attention.length}`;
  $('attention').replaceChildren(...(attention.length ? cardsWithGroups(attention) : [h('div', { class: 'empty', text: 'Nothing negative needs attention for these filters. 👍' })]));

  $('results-count').textContent = `· ${rest.length} stories`;
  const lowCount = state.items.filter((it) => it.relevance < state.config.threshold && it.status === 'open').length;
  $('results-hint').textContent = state.f.low
    ? `Showing low-confidence matches too (below ${state.config.threshold}).`
    : `Hiding ${lowCount} low-confidence match${lowCount === 1 ? '' : 'es'} (relevance below ${state.config.threshold}). Turn on “Show low-confidence” to see them.`;

  const list = $('results');
  list.replaceChildren(...(rest.length ? cardsWithGroups(rest.slice(0, state.shown)) : [h('div', { class: 'empty', text: state.items.length ? 'No results match these filters.' : 'No results yet. Press “Check now” to run the first scan.' })]));
  if (rest.length > state.shown) list.append(h('button', { class: 'btn more', type: 'button', onclick: () => { state.shown += PAGE; renderLists(); } }, `Show ${Math.min(PAGE, rest.length - state.shown)} more`));
  setBarWidths($('attention'));
  setBarWidths(list);
}

function renderChart() {
  $('legend').replaceChildren(...SENTIMENTS.map((s) => {
    const swatch = h('i');
    swatch.style.background = SENT_COLORS[s.key];
    return h('span', {}, swatch, s.label);
  }));

  const days = [];
  for (let i = 29; i >= 0; i--) days.push(new Date(Date.now() - i * 86400000).toISOString().slice(0, 10));
  const rows = state.trends.filter((r) => state.f.opco === 'ALL' || r.opco === state.f.opco);
  const data = days.map((d) => {
    const out = { day: d, negative: 0, neutral: 0, positive: 0 };
    for (const r of rows) if (r.day === d) out[r.sentiment] += r.n;
    return out;
  });
  const max = Math.max(4, ...data.map((d) => d.negative + d.neutral + d.positive));
  const W = 600, H = 150, top = 6, bottom = 18, left = 22, bw = (W - left) / days.length;
  const NS = 'http://www.w3.org/2000/svg';
  const s = (tag, attrs) => {
    const el = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    return el;
  };
  const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: 'none', role: 'img', 'aria-label': 'Daily relevant results by sentiment, last 30 days' });
  const y = (v) => H - bottom - (v / max) * (H - top - bottom);
  for (const v of [0, Math.round(max / 2), max]) {
    svg.append(s('line', { x1: left, x2: W, y1: y(v), y2: y(v), class: 'grid', 'stroke-width': 1 }));
    const t = s('text', { x: 0, y: y(v) + 3, class: 'axis' });
    t.textContent = v;
    svg.append(t);
  }
  const caption = $('chart-caption');
  data.forEach((d, i) => {
    const x = left + i * bw + 1.5;
    const w = Math.max(2, bw - 3);
    let base = 0;
    for (const k of ['negative', 'neutral', 'positive']) {
      if (!d[k]) continue;
      const y0 = y(base), y1 = y(base + d[k]);
      svg.append(s('rect', { x, y: y1, width: w, height: Math.max(1, y0 - y1 - (base ? 2 : 0)), fill: SENT_COLORS[k], rx: 1.5 }));
      base += d[k];
    }
    if ((data.length - 1 - i) % 7 === 0) {
      const t = s('text', { x: x + w / 2, y: H - 4, 'text-anchor': 'middle', class: 'axis' });
      t.textContent = new Date(`${d.day}T12:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      svg.append(t);
    }
    const hit = s('rect', { x: left + i * bw, y: 0, width: bw, height: H - bottom, class: 'day-hit', tabindex: 0 });
    const label = `${new Date(`${d.day}T12:00:00`).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}: ${d.negative} negative, ${d.neutral} neutral, ${d.positive} positive`;
    const title = s('title', {});
    title.textContent = label;
    hit.append(title);
    const show = () => {
      svg.querySelectorAll('.day-hit.active').forEach((el) => el.classList.remove('active'));
      hit.classList.add('active');
      caption.textContent = label;
    };
    hit.addEventListener('mouseenter', show);
    hit.addEventListener('click', show);
    hit.addEventListener('focus', show);
    svg.append(hit);
  });
  $('chart').replaceChildren(svg);
}

// ------------------------------------------------------------------ topics

function termList(label, terms, cls = '') {
  return h('div', { class: 'terms' }, h('span', { class: 'lbl', text: label }),
    terms.length ? terms.map((t) => h('span', { class: `term ${cls}`, text: t })) : h('span', { class: 'term', text: '— none —' }));
}

function topicForm(t, onDone) {
  const isNewTopic = !t;
  t = t || { name: '', opco: state.f.opco !== 'ALL' ? state.f.opco : state.config.opcos[0].code, type: 'project', keywords: [], context: [], exclude: [], confirm: [], paused: false };
  const field = (label, el, hint) => h('label', {}, h('span', {}, label, hint ? h('small', { text: ` — ${hint}` }) : null), el);
  const name = h('input', { type: 'text', value: t.name, required: true });
  const opco = h('select', {}, ...state.config.opcos.map((o) => h('option', { value: o.code, text: `${o.name} (${o.code})` })));
  opco.value = t.opco;
  const type = h('select', {}, h('option', { value: 'opco', text: 'OpCo' }), h('option', { value: 'project', text: 'Project' }), h('option', { value: 'location', text: 'Location' }));
  type.value = t.type;
  const ta = (list) => {
    const el = h('textarea', { rows: String(Math.max(3, list.length + 1)) });
    el.value = list.join('\n');
    // Grow with the content so no terms are hidden behind a scrollbar.
    el.addEventListener('input', () => { el.style.height = 'auto'; el.style.height = `${el.scrollHeight + 2}px`; });
    requestAnimationFrame(() => el.dispatchEvent(new Event('input')));
    return el;
  };
  const kw = ta(t.keywords), ctx = ta(t.context), ex = ta(t.exclude), conf = ta(t.confirm);
  const err = h('p', { class: 'error', role: 'alert' });
  const save = async (e) => {
    e.preventDefault();
    const lines = (el) => el.value.split('\n').map((s) => s.trim()).filter(Boolean);
    const body = { name: name.value, opco: opco.value, type: type.value, keywords: lines(kw), context: lines(ctx), exclude: lines(ex), confirm: lines(conf), paused: t.paused };
    try {
      await api(isNewTopic ? '/api/topics' : `/api/topics/${t.id}`, { method: isNewTopic ? 'POST' : 'PUT', body });
      state.editing = null;
      await loadTopics();
      onDone?.();
      render();
    } catch (e2) {
      err.textContent = e2.message;
    }
  };
  return h('form', { class: 'form topic-card', '--c': opcoOf(t.opco).color, onsubmit: save },
    field('Name', name),
    h('div', { class: 'row2' }, field('OpCo', opco), field('Type', type)),
    field('Keywords', kw, 'one per line; must match at least one'),
    field('Context terms', ctx, 'one per line; result must also mention one'),
    field('Exclude terms', ex, 'one per line; drop results containing any'),
    field('Open questions / notes', conf, 'shown in yellow; clear once confirmed'),
    err,
    h('div', { class: 'topic-actions' },
      h('button', { class: 'btn btn-primary', type: 'submit' }, isNewTopic ? 'Add topic' : 'Save'),
      h('button', { class: 'btn', type: 'button', onclick: () => { state.editing = null; renderTopics(); } }, 'Cancel'))
  );
}

// Shows the automatic OpCo ↔ project linking (see src/context.js).
function linkedLine(t) {
  if (t.type === 'opco') {
    const jobs = state.topics.filter((j) => j.opco === t.opco && j.type !== 'opco' && !j.paused);
    if (!jobs.length) return null;
    return h('p', { class: 'linked', text: `Also counts its projects as context: ${jobs.map((j) => j.name).join(', ')}` });
  }
  const o = opcoOf(t.opco);
  return o.names?.length ? h('p', { class: 'linked', text: `Also counts ${o.name} names as context: ${o.names.join(', ')}` }) : null;
}

function renderTopics() {
  $('topics-count').textContent = `· ${state.topics.filter((t) => !t.paused).length} active, ${state.topics.filter((t) => t.paused).length} paused`;
  $('new-topic').replaceChildren(state.editing === 'new' ? h('div', { class: 'list mt12' }, topicForm(null)) : '');
  const list = state.topics.filter((t) => state.f.opco === 'ALL' || t.opco === state.f.opco);
  $('topics').replaceChildren(...list.map((t) => {
    if (state.editing === t.id) return topicForm(t);
    const o = opcoOf(t.opco);
    const update = async (patch) => {
      try {
        await api(`/api/topics/${t.id}`, { method: 'PUT', body: { ...t, ...patch } });
        await loadTopics();
        render();
      } catch (e) {
        alert(e.message);
      }
    };
    return h('div', { class: `topic-card ${t.paused ? 'paused' : ''}`, '--c': o.color },
      h('h3', {}, h('span', { class: 'tag', '--c': o.color, '--on-c': onColor(o.color), text: o.code }), t.name,
        h('span', { class: 'badge-state', text: t.type === 'opco' ? 'OpCo' : t.type[0].toUpperCase() + t.type.slice(1) }),
        t.paused ? h('span', { class: 'badge-state', text: 'Paused' }) : null),
      termList('Keywords', t.keywords),
      termList('Context terms (need one)', t.context),
      termList('Exclude', t.exclude, 'ex'),
      linkedLine(t),
      t.confirm.length ? h('div', { class: 'confirm' }, h('strong', { text: 'Confirm with leadership' }), h('ul', {}, t.confirm.map((c) => h('li', { text: c })))) : null,
      canEdit() && h('div', { class: 'topic-actions' },
        h('button', { class: 'btn btn-small', type: 'button', onclick: () => { state.editing = t.id; renderTopics(); } }, 'Edit'),
        h('button', { class: 'btn btn-small', type: 'button', onclick: () => update({ paused: !t.paused }) }, t.paused ? 'Resume' : 'Pause'),
        t.confirm.length ? h('button', { class: 'btn btn-small', type: 'button', onclick: () => confirm('Mark all open questions on this topic as confirmed?') && update({ confirm: [] }) }, 'Mark confirmed') : null,
        h('button', { class: 'btn btn-small btn-danger', type: 'button', onclick: async () => {
          if (!confirm(`Remove “${t.name}”? Past results stay in history.`)) return;
          await api(`/api/topics/${t.id}`, { method: 'DELETE' });
          await loadTopics();
          render();
        } }, 'Remove'))
    );
  }));
  document.querySelectorAll('.tag').forEach((el) => { if (!el.style.getPropertyValue('--on-c')) el.style.setProperty('--on-c', onColor(el.style.getPropertyValue('--c') || '#004C9D')); });
}

// ------------------------------------------------------------------ scans

async function renderScans() {
  const { scans, runs } = await api('/api/scans');
  $('scans').replaceChildren(...(scans.length ? scans.map((s) => h('div', {},
    h('span', { text: `${fullTime(s.started_at)} · ${s.trigger === 'manual' ? 'Check now' : 'Scheduled'}` }),
    h('span', { text: s.finished_at ? `${s.new_items} new · ${s.topics_total} topics` : `running ${s.topics_done}/${s.topics_total}` }))) : [h('div', { text: 'No scans yet.' })]));
  $('runs').replaceChildren(...(runs.length ? runs.map((r) => h('div', {},
    h('strong', { text: r.topic_name || `Topic ${r.topic_id}` }),
    h('span', {}, `${r.fetched} found → ${r.excluded} excluded, ${r.no_context} no context, ${r.duplicates} dupes → ${r.new_items} new (${r.scorer || '—'})`),
    h('span', { class: 'src' }, ...Object.entries(r.sources).map(([k, v]) => h('span', { class: String(v).startsWith('error') ? 'src-err' : '', text: `${k}: ${v}  ` }))))) : [h('div', { text: 'Per-source details appear after the first scan.' })]));
}

// ------------------------------------------------------------------ data

async function loadTopics() {
  state.topics = (await api('/api/topics')).topics;
}
async function loadItems() {
  const [{ items }, { rows }] = await Promise.all([api('/api/items?days=90'), api('/api/trends')]);
  state.items = items;
  state.trends = rows;
  buildStories();
}


// ------------------------------------------------------------------ reports

// Report builder: dates + companies + topics → fresh check → report (view, CSV, PDF).
const REPORT_PRESETS = [
  ['7', 'Last 7 days'], ['30', 'Last 30 days'], ['this-week', 'This week'], ['last-week', 'Last week'],
  ['this-month', 'This month'], ['last-month', 'Last month'], ['custom', 'Custom dates'],
];
const report = { preset: '30', from: '', to: '', opcos: new Set(), topics: new Set(), scope: 'all', low: false, data: null, waitingFor: null };

const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const dayStart = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

// Local-time date range for the chosen preset, as [start of first day, end of last day].
function reportRange() {
  const today = dayStart(new Date());
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  let from = today;
  let to = today;
  switch (report.preset) {
    case '7': from = new Date(today); from.setDate(today.getDate() - 6); break;
    case '30': from = new Date(today); from.setDate(today.getDate() - 29); break;
    case 'this-week': from = monday; break;
    case 'last-week': from = new Date(monday); from.setDate(monday.getDate() - 7); to = new Date(monday); to.setDate(monday.getDate() - 1); break;
    case 'this-month': from = new Date(today.getFullYear(), today.getMonth(), 1); break;
    case 'last-month': from = new Date(today.getFullYear(), today.getMonth() - 1, 1); to = new Date(today.getFullYear(), today.getMonth(), 0); break;
    case 'custom':
      from = report.from ? new Date(`${report.from}T00:00:00`) : today;
      to = report.to ? new Date(`${report.to}T00:00:00`) : today;
      if (to < from) [from, to] = [to, from];
      break;
  }
  const end = new Date(to);
  end.setHours(23, 59, 59, 999);
  return { from, to: end };
}

// Topics offered: those of the chosen companies (all companies when none chosen).
const reportTopics = () => state.topics.filter((t) => !report.opcos.size || report.opcos.has(t.opco));

function reportParams(format) {
  const { from, to } = reportRange();
  const p = new URLSearchParams({ from: from.toISOString(), to: to.toISOString(), scope: report.scope });
  if (report.opcos.size) p.set('opcos', [...report.opcos].join(','));
  const topics = [...report.topics].filter((id) => reportTopics().some((t) => t.id === id));
  if (topics.length) p.set('topics', topics.join(','));
  if (report.low) p.set('low', '1');
  if (format) p.set('format', format);
  return p;
}

function describeReport() {
  const { from, to } = reportRange();
  const fmt = (d) => d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  const companies = report.opcos.size ? [...report.opcos].map((c) => opcoOf(c).name).join(', ') : 'All companies';
  const chosen = [...report.topics].map(topicOf).filter((t) => t && reportTopics().includes(t));
  const topics = chosen.length ? chosen.map((t) => t.name).join(', ') : 'all topics';
  return { dates: `${fmt(from)} – ${fmt(to)}`, scope: `${companies} · ${topics}${report.scope === 'us' ? ' · only stories that name or may show us' : ''}${report.low ? ' · incl. low-confidence' : ''}` };
}

function renderReportBuilder() {
  const box = $('report-builder');
  const chip = (label, pressed, onclick, color) =>
    h('button', { class: 'chip', type: 'button', 'aria-pressed': String(pressed), onclick, '--c': color }, color ? h('span', { class: 'dot' }) : null, label);
  const rerender = () => { renderReportBuilder(); };

  const preset = h('select', { id: 'r-preset', onchange: (e) => { report.preset = e.target.value; rerender(); } },
    REPORT_PRESETS.map(([v, l]) => h('option', { value: v, text: l })));
  preset.value = report.preset;
  const { from, to } = reportRange();
  const dateFrom = h('input', { type: 'date', id: 'r-from', value: ymd(from), onchange: (e) => { report.preset = 'custom'; report.from = e.target.value; report.to = report.to || ymd(to); rerender(); } });
  const dateTo = h('input', { type: 'date', id: 'r-to', value: ymd(to), max: ymd(new Date()), onchange: (e) => { report.preset = 'custom'; report.to = e.target.value; report.from = report.from || ymd(from); rerender(); } });

  const opcos = state.config.opcos.filter((o) => state.topics.some((t) => t.opco === o.code));
  const toggle = (set, key) => { set.has(key) ? set.delete(key) : set.add(key); rerender(); };
  const topics = reportTopics();

  const scope = h('div', { class: 'segmented', role: 'group', 'aria-label': 'What to include' },
    chip('All relevant stories', report.scope === 'all', () => { report.scope = 'all'; rerender(); }),
    chip('Only stories that name or may show us', report.scope === 'us', () => { report.scope = 'us'; rerender(); }));

  const busy = !!report.waitingFor;
  box.replaceChildren(
    h('div', { class: 'filter-row report-dates' },
      h('label', {}, h('span', { class: 'filter-label', text: 'Dates' }), preset),
      h('label', {}, h('span', { class: 'filter-label', text: 'From' }), dateFrom),
      h('label', {}, h('span', { class: 'filter-label', text: 'To' }), dateTo)),
    h('div', {}, h('div', { class: 'filter-label', text: `Companies · ${report.opcos.size ? `${report.opcos.size} selected` : 'all'}` }),
      h('div', { class: 'chips' },
        chip('All companies', !report.opcos.size, () => { report.opcos.clear(); rerender(); }),
        opcos.map((o) => chip(o.name, report.opcos.has(o.code), () => toggle(report.opcos, o.code), o.color)))),
    h('div', {}, h('div', { class: 'filter-label', text: `Topics · ${[...report.topics].filter((id) => topics.some((t) => t.id === id)).length || 'all'} of ${topics.length}` }),
      h('div', { class: 'chips' },
        chip('All topics', ![...report.topics].some((id) => topics.some((t) => t.id === id)), () => { report.topics.clear(); rerender(); }),
        topics.map((t) => chip(t.name, report.topics.has(t.id), () => toggle(report.topics, t.id), opcoOf(t.opco).color)))),
    h('div', {}, h('div', { class: 'filter-label', text: 'Include' }), scope,
      h('label', { class: 'toggle' }, h('input', { type: 'checkbox', checked: report.low, onchange: (e) => { report.low = e.target.checked; } }), 'Include low-confidence matches')),
    h('div', { class: 'report-actions' },
      canEdit() ? h('button', { class: 'btn', type: 'button', disabled: busy || !!state.status?.running, onclick: checkForReport }, busy ? 'Checking…' : 'Check now for these') : null,
      h('button', { class: 'btn btn-primary', type: 'button', onclick: () => viewReport() }, 'View report'),
      h('a', { class: 'btn', href: `/api/report?${reportParams('csv')}`, id: 'r-csv' }, 'Download CSV'),
      h('button', { class: 'btn', type: 'button', onclick: savePdf }, 'Save as PDF')),
  );
}

async function checkForReport() {
  const { from } = reportRange();
  const days = Math.ceil((Date.now() - from.getTime()) / 86400000) + 1;
  const chosen = [...report.topics].filter((id) => reportTopics().some((t) => t.id === id));
  const topicIds = (chosen.length ? chosen : reportTopics().map((t) => t.id)).filter((id) => !topicOf(id)?.paused);
  try {
    const { scan, alreadyRunning } = await api('/api/scan', { method: 'POST', body: { topicIds, days } });
    report.waitingFor = scan.id;
    $('report-status').textContent = alreadyRunning
      ? 'A scan is already running; the report will refresh when it finishes.'
      : `Checking ${topicIds.length} topic${topicIds.length === 1 ? '' : 's'} over the last ${Math.min(days, 90)} days… the report opens when it's done.`;
    renderReportBuilder();
    refreshStatus();
  } catch (e) {
    $('report-status').textContent = e.message;
  }
}

// Called by refreshStatus: open the report once the requested check finishes.
function reportCheckProgress() {
  if (!report.waitingFor) return;
  const s = state.status;
  if (s.running || s.checking) {
    $('report-status').textContent = s.running
      ? `Checking: ${s.running.topics_done} of ${s.running.topics_total} topics searched…`
      : `Reading ${s.checking} new stor${s.checking === 1 ? 'y' : 'ies'} for our names and logos…`;
    return;
  }
  if ((s.last?.id ?? 0) >= report.waitingFor) {
    report.waitingFor = null;
    $('report-status').textContent = `Check finished ${new Date().toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}. Report updated.`;
    renderReportBuilder();
    viewReport();
  }
}

async function viewReport({ scroll = true } = {}) {
  try {
    report.data = await api(`/api/report?${reportParams()}`);
    renderReportView();
    if (scroll) $('report-view').scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (e) {
    $('report-status').textContent = e.message;
  }
}

async function savePdf() {
  await viewReport({ scroll: false });
  // The print stylesheet prints only the report; choose "Save as PDF".
  document.body.classList.add('printing-report');
  const done = () => { document.body.classList.remove('printing-report'); window.removeEventListener('afterprint', done); };
  window.addEventListener('afterprint', done);
  window.print();
  setTimeout(done, 1000);
}

function renderReportView() {
  const { rows, summary } = report.data;
  const d = describeReport();
  const t = summary.totals;
  const stat = (n, label, cls = '') => h('div', { class: `stat ${cls}` }, h('div', { class: 'num', text: n }), h('div', { class: 'lbl', text: label }));
  const link = (r) => (safeUrl(r.Link) ? h('a', { href: safeUrl(r.Link), target: '_blank', rel: 'noopener noreferrer', text: r.Headline }) : r.Headline);
  const table = (head, body) => h('div', { class: 'table-wrap' }, h('table', { class: 'weekly' },
    h('thead', {}, h('tr', {}, head.map((c) => h('th', { scope: 'col', text: c })))), h('tbody', {}, body)));
  const tallyRow = (x, label) => h('tr', {}, h('th', { scope: 'row', text: label }),
    [x.stories, x.named, x.photo].map((n) => h('td', { text: n })),
    h('td', { class: 'neg-n', text: x.negative }), h('td', { text: x.neutral }), h('td', { class: 'pos-n', text: x.positive }));
  const tallyHead = ['', 'Stories', 'Named', 'In photo', 'Negative', 'Neutral', 'Positive'];
  const us = rows.filter((r) => r.Association !== 'Not named or pictured');
  const sentimentPill = (s) => h('span', { class: `pill ${s}`, text: s[0].toUpperCase() + s.slice(1) });

  $('report-view').replaceChildren(h('article', { class: 'report' },
    h('header', { class: 'report-head' },
      h('div', { class: 'eyebrow', text: 'AIS media report' }),
      h('h3', { text: d.dates }),
      h('p', { class: 'report-scope', text: d.scope }),
      h('p', { class: 'report-meta', text: `Generated ${new Date().toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}` })),
    rows.length ? null : h('div', { class: 'empty', text: 'No stories match these choices. Try a wider date range, more companies, or “Check now for these”.' }),
    rows.length ? h('div', { class: 'stats' },
      stat(t.stories, 'Stories'), stat(t.named, 'Name us', 'us'), stat(t.photo, 'May show us in a photo', 'us'),
      stat(t.negative, 'Negative', 'neg'), stat(t.positive, 'Positive', 'pos')) : null,
    us.length ? h('section', {}, h('h4', { text: 'Stories that name us or may show us' }),
      h('ol', { class: 'report-list' }, us.map((r) => h('li', {},
        h('div', { class: 'report-line' }, sentimentPill(r.Sentiment), h('span', { class: 'meta', text: `${r.Published} · ${r['Operating company']} · ${r['Project / topic']}` })),
        h('div', { class: 'report-title' }, link(r)),
        h('div', { class: 'meta', text: `${r.Association}${r['Where mentioned'] ? ` · ${r['Where mentioned']}` : ''} · ${r.Source}` }),
        r.Quote && r['Where mentioned'] !== 'Headline' ? h('blockquote', { text: r.Quote }) : null,
        r['Photo check'] && r.Association !== 'Named in text' ? h('div', { class: 'meta', text: r['Photo check'] }) : null)))) : null,
    rows.length ? h('section', {}, h('h4', { text: 'By company' }), table(tallyHead, summary.byOpco.map((x) => tallyRow(x, x.key)))) : null,
    rows.length > 0 && summary.byWeek.length > 1 ? h('section', {}, h('h4', { text: 'By week (weeks start Monday)' }),
      table(tallyHead, summary.byWeek.map((x) => tallyRow(x, `Week of ${new Date(`${x.key}T12:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`)))) : null,
    rows.length ? h('section', {}, h('h4', { text: `All stories · ${rows.length}` }),
      table(['Date', 'Company', 'Project / topic', 'Headline', 'Association', 'Sentiment', 'Relevance'],
        rows.map((r) => h('tr', {}, h('td', { text: r.Published }), h('td', { text: r['Operating company'] }), h('td', { class: 'wrap', text: r['Project / topic'] }),
          h('td', { class: 'wrap headline' }, link(r)), h('td', { text: r.Association }), h('td', {}, sentimentPill(r.Sentiment)), h('td', { text: r.Relevance }))))) : null,
  ));
}

function render() {
  renderTiles();
  renderFilters();
  renderOpcoView();
  renderLists();
  renderChart();
  renderWeekly();
  renderTopics();
  renderReportBuilder();
}

let pollTimer;
async function refreshStatus() {
  clearTimeout(pollTimer);
  try {
    state.status = await api('/api/status');
    renderStatus();
    reportCheckProgress();
    const lastId = state.status.last?.id ?? null;
    const runningDone = `${state.status.running?.topics_done}|${state.status.checking}`;
    // Refresh results whenever a scan finishes or makes progress.
    if (lastId !== state.lastScanId || runningDone !== state.runningDone) {
      const first = state.runningDone === undefined;
      state.lastScanId = lastId;
      state.runningDone = runningDone;
      if (!first) {
        await Promise.all([loadItems(), loadTopics()]);
        render();
        renderScans();
      }
    }
  } catch (e) {
    console.error(e);
  }
  pollTimer = setTimeout(refreshStatus, state.status?.running || state.status?.checking ? 5000 : 60000);
}

async function init() {
  loadSeen();
  readHash();
  const [config] = await Promise.all([api('/api/config'), loadTopics(), loadItems()]);
  state.config = config;
  $('footer').textContent = `Relevance: ${config.scorer} · Sources: ${config.sources.join(', ')} · Scans at ${config.scanHours.map((h) => `${((h + 11) % 12) + 1} ${h < 12 ? 'AM' : 'PM'}`).join(' & ')} Pacific`;
  if (!canEdit()) {
    $('check-now').hidden = true;
    $('add-topic').hidden = true;
    $('view-only').hidden = false;
  }
  render();
  renderScans();
  await refreshStatus();

  $('check-now').addEventListener('click', checkNow);
  $('f-topic').addEventListener('change', (e) => {
    const t = topicOf(Number(e.target.value));
    setFilter({ topic: e.target.value, ...(t && state.f.opco !== 'ALL' && t.opco !== state.f.opco ? { opco: t.opco } : {}) });
  });
  $('f-range').addEventListener('change', (e) => setFilter({ range: e.target.value }));
  $('f-sort').addEventListener('change', (e) => setFilter({ sort: e.target.value }));
  $('f-q').addEventListener('input', (e) => setFilter({ q: e.target.value }));
  $('f-low').addEventListener('change', (e) => setFilter({ low: e.target.checked }));
  $('f-handled').addEventListener('change', (e) => setFilter({ handled: e.target.checked }));
  $('f-starred').addEventListener('change', (e) => setFilter({ starred: e.target.checked }));
  $('f-new').addEventListener('change', (e) => setFilter({ onlyNew: e.target.checked }));
  $('add-topic').addEventListener('click', () => { state.editing = 'new'; renderTopics(); });
  window.addEventListener('hashchange', () => { readHash(); render(); });
  // Remember when this person last looked, for the NEW badges next time.
  document.addEventListener('visibilitychange', () => document.visibilityState === 'hidden' && saveSeen());
  window.addEventListener('pagehide', saveSeen);
}

init().catch((e) => {
  $('scan-status').textContent = `Error: ${e.message}`;
});
