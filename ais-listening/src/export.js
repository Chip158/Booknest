// CSV export for spreadsheets / SharePoint. Headlines are clickable in Excel
// and Google Sheets via =HYPERLINK(); a plain Link column is included too.

import { OPCOS, RELEVANCE_THRESHOLD, TIMEZONE } from '../config/settings.js';

export const COLUMNS = [
  'Week of', 'Published', 'Operating company', 'Project / topic', 'Headline', 'Link', 'Source', 'Platform',
  'Association', 'Where mentioned', 'Quote', 'Photo check', 'Sentiment', 'Relevance', 'Why', 'Status',
];

const opcoName = (code) => OPCOS.find((o) => o.code === code)?.name || code;

// Monday (Pacific) of the week a story was published, as YYYY-MM-DD.
export function weekOf(iso) {
  const d = new Date(iso);
  const local = new Date(d.toLocaleString('en-US', { timeZone: TIMEZONE }));
  const day = (local.getDay() + 6) % 7; // Monday = 0
  local.setDate(local.getDate() - day);
  return `${local.getFullYear()}-${String(local.getMonth() + 1).padStart(2, '0')}-${String(local.getDate()).padStart(2, '0')}`;
}

export function association(it) {
  if (it.exposure === 'named') return 'Named in text';
  if (it.photo === 'yes') return 'Logo / equipment in photo';
  if (it.photo === 'unclear') return 'Possibly in photo';
  return 'Not named or pictured';
}

function photoCheck(it) {
  return {
    yes: 'Our logo/equipment visible', unclear: 'Possibly ours — look', no: 'Checked: not us',
    none: 'No photo', unchecked: 'Photo not checked',
  }[it.photo] || '';
}

// Text from the web must never run as a spreadsheet formula.
export function safeCell(v) {
  const s = String(v ?? '');
  return /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
}

function csvField(s) {
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function hyperlink(url, label) {
  // Excel's HYPERLINK accepts at most 255 characters per argument.
  if (!url || url.length > 255 || !/^https?:\/\//.test(url)) return safeCell(label);
  const q = (x) => x.replace(/"/g, '""');
  return `=HYPERLINK("${q(url)}","${q(label.slice(0, 250))}")`;
}

export function exportRow(it, topicName) {
  const link = it.article_url || it.url;
  const published = it.published_at || it.first_seen_at;
  return {
    'Week of': weekOf(published),
    Published: published.slice(0, 10),
    'Operating company': opcoName(it.opco),
    'Project / topic': topicName || '',
    Headline: it.title,
    Link: link,
    Source: it.source || it.domain || '',
    Platform: it.platform,
    Association: association(it),
    'Where mentioned': it.mention_where || '',
    Quote: it.mention_quote || '',
    'Photo check': [photoCheck(it), it.photo_note].filter(Boolean).join(' — '),
    Sentiment: it.sentiment,
    Relevance: it.relevance,
    Why: it.why || '',
    Status: it.status + (it.starred ? ', starred' : ''),
  };
}

// The same article can match several topics (e.g. Cabeza Prieta and Las Playas
// Intaglio): list it once, with every project it relates to.
export function mergeDuplicates(rows) {
  const byLink = new Map();
  for (const r of rows) {
    const key = r.Link;
    const prev = byLink.get(key);
    if (!prev) {
      byLink.set(key, { ...r });
      continue;
    }
    const topics = new Set(`${prev['Project / topic']}; ${r['Project / topic']}`.split('; ').filter(Boolean));
    const keep = r.Relevance > prev.Relevance ? { ...r } : prev;
    keep['Project / topic'] = [...topics].join('; ');
    byLink.set(key, keep);
  }
  return [...byLink.values()];
}

export function toCsv(rows) {
  const lines = [COLUMNS.join(',')];
  for (const r of rows) {
    lines.push(COLUMNS.map((c) => {
      if (c === 'Headline') return csvField(hyperlink(r.Link, r.Headline));
      return csvField(typeof r[c] === 'number' ? String(r[c]) : safeCell(r[c]));
    }).join(','));
  }
  // BOM so Excel opens UTF-8 (curly quotes, accents) correctly.
  return `﻿${lines.join('\r\n')}\r\n`;
}

// Rows for the export: relevant, checked, not dismissed; named/pictured first.
export function selectForExport(items, { all = false } = {}) {
  const rank = (it) => (it.exposure === 'named' || it.photo === 'yes' ? 0 : 1);
  return items
    .filter((it) => it.exposure !== 'pending' && it.status !== 'dismissed' && (all || it.relevance >= RELEVANCE_THRESHOLD))
    .sort((a, b) => rank(a) - rank(b) || (b.published_at || b.first_seen_at).localeCompare(a.published_at || a.first_seen_at));
}

// ---------------------------------------------------------------- reports

const isUsRow = (r) => r.Association !== 'Not named or pictured';

// Report for the dashboard's report builder (also used for its CSV).
// filters: { from, to } ISO datetimes; opcos: codes; topics: ids;
// scope: 'all' | 'us' (named, logo, or possibly in a photo); low: include low-confidence.
export function buildReport(items, { from, to, opcos = [], topics = [], scope = 'all', low = false } = {}) {
  const wantOpco = new Set(opcos);
  const wantTopic = new Set(topics.map(Number));
  const picked = selectForExport(items, { all: low }).filter((it) => {
    const when = it.published_at || it.first_seen_at;
    if (from && when < from) return false;
    if (to && when > to) return false;
    if (wantOpco.size && !wantOpco.has(it.opco)) return false;
    if (wantTopic.size && !wantTopic.has(it.topic_id)) return false;
    return true;
  });
  let rows = mergeDuplicates(picked.map((it) => exportRow(it, it.topic_name)));
  if (scope === 'us') rows = rows.filter(isUsRow);
  return { rows, summary: summarize(rows) };
}

export function summarize(rows) {
  const tally = (list) => ({
    stories: list.length,
    named: list.filter((r) => r.Association === 'Named in text').length,
    photo: list.filter((r) => r.Association === 'Logo / equipment in photo' || r.Association === 'Possibly in photo').length,
    negative: list.filter((r) => r.Sentiment === 'negative').length,
    neutral: list.filter((r) => r.Sentiment === 'neutral').length,
    positive: list.filter((r) => r.Sentiment === 'positive').length,
  });
  const group = (key) => {
    const m = new Map();
    for (const r of rows) {
      if (!m.has(r[key])) m.set(r[key], []);
      m.get(r[key]).push(r);
    }
    return [...m].map(([k, list]) => ({ key: k, ...tally(list) }));
  };
  return {
    totals: tally(rows),
    byOpco: group('Operating company').sort((a, b) => b.named + b.photo - (a.named + a.photo) || b.stories - a.stories),
    byWeek: group('Week of').sort((a, b) => b.key.localeCompare(a.key)),
    aboutUs: rows.filter(isUsRow).length,
  };
}
