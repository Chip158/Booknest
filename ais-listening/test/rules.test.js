import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyRules, buildQuery } from '../src/filter.js';
import { canonicalUrl, containsTerm, jaccard, titleKey } from '../src/text.js';
import { parseRss } from '../src/sources/rss.js';
import { isScanSlot, nextScanTime } from '../src/schedule.js';
import { ruleScore } from '../src/relevance.js';
import { SEED_TOPICS } from '../config/seed-topics.js';
import { OPCOS } from '../config/settings.js';

const topic = (name) => SEED_TOPICS.find((t) => t.name.startsWith(name));
const social = (title, snippet = '') => ({ title, snippet, contextInQuery: false });

test('acronyms match case-sensitively as whole words', () => {
  assert.ok(containsTerm('AISI wins heavy civil contract', 'AISI'));
  assert.ok(!containsTerm('Aisi said hello', 'AISI'));
  assert.ok(!containsTerm('the brain is fine', 'AI'));
  assert.ok(containsTerm('AI-powered tools', 'AI'));
  assert.ok(containsTerm('f.d. thomas crews repaint', 'F.D. Thomas'));
  assert.ok(containsTerm('Lukeville border-wall work', 'border wall'));
});

test('AISI: requires context and honors excludes', () => {
  const t = topic('AIS Infrastructure');
  assert.equal(applyRules(t, social('AISI awarded heavy civil contract in Georgia')).ok, true);
  assert.equal(applyRules(t, social('AISI 304 stainless steel grade explained')).ok, false);
  assert.equal(applyRules(t, social('AIS Infrastructure uses AI for scheduling', 'construction')).reason, 'excluded');
  assert.equal(applyRules(t, social('AISI hosts webinar')).reason, 'no_context');
});

test('RSI: stock-chart and injury meanings are dropped', () => {
  const t = topic('RSI');
  assert.equal(applyRules(t, social('RSI shows stock is overbought')).ok, false);
  assert.equal(applyRules(t, social('RSI crews begin remediation at Hunters Point shipyard')).ok, true);
});

test('Bay Bridge: Maryland bridge excluded', () => {
  const t = topic('Bay Bridge');
  assert.equal(applyRules(t, social('Chesapeake Bay Bridge painting contractor named')).ok, false);
  assert.equal(applyRules(t, social('Caltrans: Bay Bridge repaint work continues', 'F.D. Thomas crews')).ok, true);
});

test('Hunters Point Queens excluded', () => {
  const t = topic('Hunters Point');
  assert.equal(applyRules(t, social('Hunters Point Queens waterfront cleanup')).ok, false);
});

test('news results trust full-text context from the search engine', () => {
  const t = topic('Cabeza Prieta');
  const r = applyRules(t, { title: 'Refuge managers worry about Cabeza Prieta', snippet: '', contextInQuery: true });
  assert.equal(r.ok, true);
  assert.match(r.matched.via, /search engine/);
});

test('every seed topic has an OpCo from settings and keywords', () => {
  for (const t of SEED_TOPICS) {
    assert.ok(OPCOS.some((o) => o.code === t.opco), t.name);
    assert.ok(t.keywords.length, t.name);
  }
});

test('buildQuery produces boolean query with excludes', () => {
  const q = buildQuery({ keywords: ['Bay Bridge'], context: ['Caltrans', 'F.D. Thomas'], exclude: ['Chesapeake'] });
  assert.equal(q, '"Bay Bridge" (Caltrans OR "F.D. Thomas") -Chesapeake');
});

test('dedupe: same story from two outlets clusters together', () => {
  const a = titleKey('Border wall construction resumes near Lukeville - Arizona Republic');
  const b = titleKey('Border wall construction resumes near Lukeville, officials say - KJZZ');
  assert.ok(jaccard(a, b) >= 0.55, String(jaccard(a, b)));
  assert.ok(jaccard(a, titleKey('Tecate beer sales rise')) < 0.2);
  assert.equal(canonicalUrl('https://www.example.com/a/?utm_source=x&id=2#top'), 'https://example.com/a/?id=2');
});

test('rss parser handles CDATA, entities and source tags', () => {
  const xml = `<rss><channel><item><title><![CDATA[Crews &amp; cranes - KTAR]]></title><link>https://x.test/1</link>
    <pubDate>Mon, 26 Oct 2026 14:00:00 GMT</pubDate><description>&lt;b&gt;Hi&lt;/b&gt; there</description>
    <source url="https://ktar.com">KTAR</source></item></channel></rss>`;
  const [it] = parseRss(xml);
  assert.equal(it.title, 'Crews & cranes - KTAR');
  assert.equal(it.description, 'Hi there');
  assert.equal(it.source, 'KTAR');
  assert.equal(it.sourceUrl, 'https://ktar.com');
});

test('schedule: 7 AM / 7 PM Pacific across daylight saving', () => {
  assert.ok(isScanSlot(new Date('2026-07-01T14:00:00Z'))); // 7 AM PDT
  assert.ok(isScanSlot(new Date('2026-07-02T02:00:00Z'))); // 7 PM PDT
  assert.ok(isScanSlot(new Date('2026-12-01T15:00:00Z'))); // 7 AM PST
  assert.ok(!isScanSlot(new Date('2026-12-01T14:00:00Z')));
  assert.equal(nextScanTime(new Date('2026-12-01T15:30:00Z')), '2026-12-02T03:00:00.000Z');
});

test('rules fallback scores negative coverage', () => {
  const t = topic('Las Playas');
  const c = { title: 'Lawsuit claims Las Playas Intaglio damaged by border wall', snippet: '', domain: 'x.test', _matched: { keywords: ['Las Playas Intaglio'], context: ['border', 'wall', 'damage'], via: 'text' } };
  const s = ruleScore(t, c, new Map());
  assert.equal(s.sentiment, 'negative');
  assert.ok(s.relevance >= 60);
});

test('names us: exact company names, case-aware for short names', async () => {
  const { findNames, exposureOf, ruleCheck } = await import('../src/relevance.js');
  assert.deepEqual(findNames('Crews from AIS Infrastructure began work'), ['AIS Infrastructure', 'AIS']);
  assert.deepEqual(findNames('F.D. Thomas painters on the span'), ['F.D. Thomas']);
  assert.deepEqual(findNames('rsi readings and ais data feeds'), []);
  assert.equal(exposureOf({ named: false, photo: 'yes' }), 'pictured');
  assert.equal(exposureOf({ named: true, photo: 'no' }), 'named');
  assert.equal(exposureOf({ named: false, photo: 'unclear' }), 'not_named');
  const t = topic('Cabeza Prieta');
  const item = { title: 'Refuge wall work continues', snippet: '', domain: 'x.test', matched: { keywords: ['Cabeza Prieta'], context: ['wall'], via: 'text' } };
  assert.equal(ruleCheck(t, item, { text: 'The contractor, NWDD, said…', images: [] }).exposure, 'named');
  assert.equal(ruleCheck(t, item, { text: 'No company was named.', images: ['https://x/p.jpg'] }).photo, 'unchecked');
});

test('OpCo topics pick up their projects; projects pick up OpCo names', async () => {
  const { linkTopic, profileText } = await import('../src/context.js');
  const all = SEED_TOPICS.map((t, i) => ({ ...t, id: i + 1, paused: false }));
  const aisi = linkTopic(all.find((t) => t.name.startsWith('AIS Infrastructure')), all);
  assert.ok(aisi.context.includes('Cabeza Prieta') && aisi.context.includes('Lukeville'));
  // A border-wall story naming AIS Infrastructure passes; "AI infrastructure" does not.
  assert.equal(applyRules(aisi, social('AIS Infrastructure crews resume Lukeville wall work')).ok, true);
  assert.equal(applyRules(aisi, social('AI infrastructure spending soars')).ok, false);
  const wall = linkTopic(all.find((t) => t.name.startsWith('Border Wall')), all);
  assert.ok(wall.context.includes('AIS Infrastructure'));
  assert.match(profileText(aisi), /Cabeza Prieta/);
  // New jobs are picked up automatically.
  const plus = [...all, { id: 99, name: 'New Job', opco: 'AISI', type: 'project', keywords: ['Nogales'], context: [], exclude: [], confirm: [], paused: false }];
  assert.ok(linkTopic(all[0], plus).context.includes('Nogales'));
});

test('long context lists become several short queries', async () => {
  const { buildQueries } = await import('../src/filter.js');
  const qs = buildQueries({ keywords: ['X'], context: Array.from({ length: 16 }, (_, i) => `t${i}`), exclude: [] });
  assert.equal(qs.length, 3);
  assert.equal(qs[2], 'X (t14 OR t15)');
});

test('full-article excludes use specific phrases only; named + context ranks up', async () => {
  const { ruleCheck } = await import('../src/relevance.js');
  const t = topic('RSI');
  const item = { title: 'Air Force awards cleanup contracts', snippet: '', domain: 'x.test', matched: { keywords: [], context: [], via: 'search engine (full article)' } };
  const named = ruleCheck(t, item, { text: 'Awardees include RSI for remediation work.', images: [] });
  const plain = ruleCheck(t, { ...item, title: 'RSI agents' }, { text: 'Recursive RSI loops in AI.', images: [] });
  assert.ok(named.relevance >= 60 && plain.relevance < 60, `${named.relevance} / ${plain.relevance}`);
});
