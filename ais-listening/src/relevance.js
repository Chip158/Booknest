// Relevance + sentiment pass. Uses Claude when ANTHROPIC_API_KEY is set,
// otherwise (or on any API failure) falls back to transparent rule scoring.

import Anthropic from '@anthropic-ai/sdk';
import { RELEVANCE_MODEL, OPCOS } from '../config/settings.js';
import { containsTerm, truncate } from './text.js';

const BATCH = 15;

const SYSTEM = `You screen media-monitoring results for the marketing team at AIS (ASRC Industrial), a US industrial services and construction company with several operating companies (OpCos). Always write the company name as "AIS".

Search engines return many false matches because our names collide with unrelated things (e.g. "AIS" also means artificial intelligence, ship-tracking data, schools and other companies; "RSI" is a stock indicator and an injury; "Bay Bridge" exists in several states). Never assume a result is about us just because a name matches.

For each result, decide how likely it is to be genuinely about the given topic AS IT RELATES TO AIS — the OpCo itself, or the specific project/site where AIS works (coverage of the project site, its construction, impacts, protests, lawsuits, safety incidents or milestones counts even if AIS is not named).

relevance (integer 0-100):
 90-100 clearly about our company or our project/site work
 60-89  probably about it; plausible but some ambiguity
 30-59  mentions the topic but probably not about our work (e.g. general regional news)
 0-29   a different entity, place or meaning (name collision)

sentiment toward AIS / the project (not the general news tone): "negative" for anything that could become bad press or needs a response (accidents, injuries, lawsuits, violations, protests, environmental or cultural damage, delays, cost overruns, criticism); "positive" for shareable good news (awards, contract wins, milestones, safety records, community work); otherwise "neutral".

why: one short sentence (max 25 words) explaining the match or the mismatch, citing the deciding words.

Return one entry for every result id you are given.`;

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['results'],
  properties: {
    results: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'relevance', 'sentiment', 'why'],
        properties: {
          id: { type: 'string' },
          relevance: { type: 'integer' },
          sentiment: { type: 'string', enum: ['positive', 'neutral', 'negative'] },
          why: { type: 'string' },
        },
      },
    },
  },
};

function topicBrief(topic, dismissed) {
  const opco = OPCOS.find((o) => o.code === topic.opco);
  const lines = [
    `TOPIC: ${topic.name}`,
    `Type: ${topic.type}; OpCo: ${opco ? `${opco.name} (${opco.code})` : topic.opco}`,
    `Keywords: ${topic.keywords.join('; ')}`,
    `Context terms (signals it's about our work): ${topic.context.join('; ') || '(none)'}`,
    `Exclude (known false matches): ${topic.exclude.join('; ') || '(none)'}`,
  ];
  if (topic.confirm?.length) lines.push(`Notes: ${topic.confirm.join(' ')}`);
  if (dismissed.length) {
    lines.push('', 'Our team previously marked these results NOT relevant — score similar items low:');
    for (const d of dismissed) lines.push(`- ${d.title}${d.domain ? ` (${d.domain})` : ''}`);
  }
  return lines.join('\n');
}

async function scoreWithClaude(client, topic, batch, dismissed) {
  const listing = batch
    .map((c) => [
      `<result id="${c._key}">`,
      `headline: ${c.title}`,
      `source: ${c.source || ''} (${c.platform})`,
      `date: ${c.publishedAt || 'unknown'}`,
      c.snippet ? `text: ${truncate(c.snippet, 700)}` : '',
      '</result>',
    ].filter(Boolean).join('\n'))
    .join('\n');

  const response = await client.messages.create({
    model: RELEVANCE_MODEL,
    max_tokens: 8000,
    system: SYSTEM,
    output_config: { effort: 'low', format: { type: 'json_schema', schema: SCHEMA } },
    messages: [{ role: 'user', content: `${topicBrief(topic, dismissed)}\n\nRESULTS:\n${listing}` }],
  });

  if (response.stop_reason === 'refusal') throw new Error('model declined');
  const text = response.content.find((b) => b.type === 'text')?.text;
  if (!text) throw new Error(`no output (stop_reason ${response.stop_reason})`);
  const parsed = JSON.parse(text);
  return new Map(parsed.results.map((r) => [r.id, r]));
}

// ---------------------------------------------------------------- fallback

const NEG = ['lawsuit', 'sued', 'sues', 'fine', 'fined', 'violation', 'citation', 'OSHA', 'accident', 'injury', 'injured', 'killed', 'death', 'dies', 'fatal', 'protest', 'protesters', 'damage', 'damaged', 'destroyed', 'desecration', 'investigation', 'fraud', 'delay', 'delayed', 'strike', 'spill', 'contamination', 'collapse', 'allegation', 'alleged', 'criticism', 'outrage', 'fire', 'evacuated', 'cost overrun', 'halted', 'stop work', 'complaint', 'whistleblower', 'destroys', 'damages', 'desecrate', 'desecration', 'atrocity', 'toxic', 'misconduct', 'settlement', 'abuse', 'probed', 'fabricated', 'falsified', 'flooding', 'injuries'];
const POS = ['award', 'awarded', 'wins', 'won', 'completed', 'completion', 'milestone', 'celebrates', 'honored', 'recognized', 'record', 'safety award', 'grant', 'donation', 'volunteer', 'community', 'hires', 'expands', 'opens', 'ribbon cutting', 'partnership'];

export function ruleScore(topic, c, penalties) {
  const text = `${c.title}\n${c.snippet || ''}`;
  const kwInTitle = topic.keywords.some((k) => containsTerm(c.title, k));
  const ctx = c._matched.context.length;
  let relevance = 30 + Math.min(ctx, 3) * 15 + (kwInTitle ? 15 : 0);
  if (!ctx && c._matched.via.startsWith('search engine')) relevance = 45 + (kwInTitle ? 10 : 0);
  relevance -= penalties.get(c.domain) || 0;
  relevance = Math.max(0, Math.min(95, relevance));

  const neg = NEG.filter((w) => containsTerm(text, w));
  const pos = POS.filter((w) => containsTerm(text, w));
  const sentiment = neg.length > pos.length ? 'negative' : pos.length > neg.length ? 'positive' : 'neutral';

  const why = [
    c._matched.keywords.length ? `Keyword: ${c._matched.keywords.join(', ')}` : 'Keyword matched in full article',
    ctx ? `context: ${c._matched.context.slice(0, 3).join(', ')}` : `context via ${c._matched.via}`,
    neg.length ? `negative words: ${neg.slice(0, 3).join(', ')}` : pos.length ? `positive words: ${pos.slice(0, 3).join(', ')}` : '',
    penalties.get(c.domain) ? 'source often dismissed' : '',
  ].filter(Boolean).join('; ');
  return { relevance, sentiment, why: `Rules only: ${why}.` };
}

// Scores candidates in place. Returns the scorer used ('claude' | 'rules' | 'mixed').
export async function scoreCandidates(env, topic, candidates, { dismissed = [], penalties = new Map() } = {}) {
  candidates.forEach((c, i) => (c._key = `r${i + 1}`));
  let used = new Set();
  const client = env.ANTHROPIC_API_KEY ? new Anthropic({ apiKey: env.ANTHROPIC_API_KEY, maxRetries: 2 }) : null;

  for (let i = 0; i < candidates.length; i += BATCH) {
    const batch = candidates.slice(i, i + BATCH);
    let scores = null;
    if (client) {
      try {
        scores = await scoreWithClaude(client, topic, batch, dismissed);
      } catch (err) {
        console.error('relevance: Claude call failed, using rules', err?.message || err);
      }
    }
    for (const c of batch) {
      const s = scores?.get(c._key);
      if (s) {
        const penalty = penalties.get(c.domain) || 0;
        c.relevance = Math.max(0, Math.min(100, Math.round(s.relevance) - penalty));
        c.sentiment = s.sentiment;
        c.why = truncate(s.why, 240) + (penalty ? ' (source often dismissed by team)' : '');
        c.scorer = 'claude';
      } else {
        Object.assign(c, ruleScore(topic, c, penalties), { scorer: 'rules' });
      }
      used.add(c.scorer);
    }
  }
  return used.size > 1 ? 'mixed' : [...used][0] || (client ? 'claude' : 'rules');
}
