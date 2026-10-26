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
    'Photo check': [photoCheck(it), it.photo_note].filter(Boolean).join(': '),
    Sentiment: it.sentiment,
    Relevance: it.relevance,
    Why: it.why || '',
    Status: it.status + (it.starred ? ', starred' : ''),
  };
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
