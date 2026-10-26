// The check that decides what the team sees first: is one of our companies
// NAMED in the story, or VISIBLE in its photos (logo, branded equipment)?
// It also scores relevance (is this really us / our project, or a name
// collision?) and sentiment. Uses Claude when ANTHROPIC_API_KEY is set;
// otherwise (or on any API failure) falls back to transparent rules.

import Anthropic from '@anthropic-ai/sdk';
import { RELEVANCE_MODEL, OPCOS, MAX_PHOTOS } from '../config/settings.js';
import { containsTerm, truncate } from './text.js';

const SYSTEM = `You screen media-monitoring results for the marketing team at AIS (ASRC Industrial), a US industrial services and construction company with several operating companies (OpCos). Always write the company name as "AIS".

The team's main goal: catch every story or post where one of our companies is NAMED in the text, or VISIBLE in a photo (our logo, or our branded equipment, vehicles, signs, hard hats or fencing). Coverage of a project site that neither names us nor shows us is lower priority.

Our companies and how they appear:
${OPCOS.map((o) => `- ${o.name} (${o.code}): names ${o.names.map((n) => `"${n}"`).join(', ')}; logo/branding: ${o.logo}`).join('\n')}

Names collide with unrelated things ("AIS" also means artificial intelligence, ship-tracking data, schools and other companies; "RSI" is a stock indicator and an injury; "Bay Bridge" exists in several states). Never assume a match is us just because letters match: check the context.

Return:
- named_in_text: true only if the headline or text names one of OUR companies (not a look-alike).
- names_found: the exact names of ours that appear (empty if none).
- photo: "yes" if a photo clearly shows our logo or branded equipment; "unclear" if something looks like it could be ours but you can't read it; "no" if photos are shown and none show us; "none" if no photos were provided. Logos of other companies don't count.
- photo_note: what you saw (e.g. "Photo 2: yellow excavator with AIS logo on the boom"), or "".
- relevance (0-100): how sure you are this is genuinely about our company or the specific project/site where we work.
   90-100 clearly about us or our project/site; 60-89 probably; 30-59 mentions the topic but probably not our work; 0-29 a different entity, place or meaning.
- sentiment toward AIS / the project: "negative" for anything that could become bad press or needs a response (accidents, injuries, lawsuits, violations, protests, environmental or cultural damage, delays, cost overruns, criticism); "positive" for shareable good news (awards, contract wins, milestones, safety records, community work); otherwise "neutral".
- why: one short sentence (max 30 words) naming the deciding words or what is in the photo.`;

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['named_in_text', 'names_found', 'photo', 'photo_note', 'relevance', 'sentiment', 'why'],
  properties: {
    named_in_text: { type: 'boolean' },
    names_found: { type: 'array', items: { type: 'string' } },
    photo: { type: 'string', enum: ['yes', 'unclear', 'no', 'none'] },
    photo_note: { type: 'string' },
    relevance: { type: 'integer' },
    sentiment: { type: 'string', enum: ['positive', 'neutral', 'negative'] },
    why: { type: 'string' },
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

// Optional reference logos (public/logos/*.png) so the photo check knows them.
let logoCache;
async function logoBlocks(env) {
  if (logoCache) return logoCache;
  const blocks = [];
  for (const o of OPCOS.filter((x) => x.logoFile)) {
    try {
      const res = await env.ASSETS.fetch(new Request(`https://assets.local/logos/${o.logoFile}`));
      if (!res.ok) continue;
      const bytes = new Uint8Array(await res.arrayBuffer());
      let bin = '';
      for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
      blocks.push({ type: 'text', text: `Reference logo for ${o.name}:` });
      blocks.push({ type: 'image', source: { type: 'base64', media_type: res.headers.get('Content-Type') || 'image/png', data: btoa(bin) } });
    } catch {}
  }
  return (logoCache = blocks);
}

async function askClaude(client, env, topic, item, read, dismissed, withPhotos) {
  const photos = withPhotos ? read.images.slice(0, MAX_PHOTOS) : [];
  const text = [
    topicBrief(topic, dismissed),
    '',
    'RESULT',
    `headline: ${item.title}`,
    `source: ${item.source || ''} (${item.platform})`,
    `date: ${item.published_at || 'unknown'}`,
    read.text ? `full text${read.textChecked ? '' : ' (partial)'}:\n${truncate(read.text, 10000)}` : `snippet: ${item.snippet || '(none)'} (the full article could not be opened)`,
    photos.length ? `\n${photos.length} photo(s) from the page follow.` : '\nNo photos were available.',
  ].join('\n');
  const content = [...(withPhotos && photos.length ? await logoBlocks(env) : []), { type: 'text', text }];
  photos.forEach((url, i) => {
    content.push({ type: 'text', text: `Photo ${i + 1}:` });
    content.push({ type: 'image', source: { type: 'url', url } });
  });

  const response = await client.messages.create({
    model: RELEVANCE_MODEL,
    max_tokens: 4000,
    system: SYSTEM,
    output_config: { effort: 'low', format: { type: 'json_schema', schema: SCHEMA } },
    messages: [{ role: 'user', content }],
  });
  if (response.stop_reason === 'refusal') throw new Error('model declined');
  const out = response.content.find((b) => b.type === 'text')?.text;
  if (!out) throw new Error(`no output (stop_reason ${response.stop_reason})`);
  return JSON.parse(out);
}

export function exposureOf({ named, photo }) {
  if (named) return 'named';
  if (photo === 'yes') return 'pictured';
  return 'not_named';
}

// Full check of one stored result. `read` comes from article.readResult().
export async function checkResult(env, topic, item, read, { dismissed = [], penalties = new Map() } = {}) {
  const penalty = penalties.get(item.domain) || 0;
  if (env.ANTHROPIC_API_KEY) {
    const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY, maxRetries: 2 });
    let r = null;
    let photoNote = '';
    try {
      r = await askClaude(client, env, topic, item, read, dismissed, true);
    } catch (err) {
      // Most often a photo the API couldn't download: retry on the text alone.
      console.error('check: retrying without photos', err?.message || err);
      try {
        r = await askClaude(client, env, topic, item, read, dismissed, false);
        if (read.images.length) photoNote = 'Photos could not be loaded for checking.';
      } catch (err2) {
        console.error('check: Claude failed, using rules', err2?.message || err2);
      }
    }
    if (r) {
      const photo = photoNote ? 'unchecked' : r.photo;
      return {
        relevance: Math.max(0, Math.min(100, Math.round(r.relevance) - penalty)),
        sentiment: r.sentiment,
        why: truncate(r.why, 260) + (penalty ? ' (source often dismissed by team)' : ''),
        names_found: r.named_in_text ? r.names_found.slice(0, 8) : [],
        photo,
        photo_note: truncate(photoNote || r.photo_note, 200),
        exposure: exposureOf({ named: r.named_in_text, photo }),
        scorer: 'claude',
      };
    }
  }
  return ruleCheck(topic, item, read, penalties);
}

// Our company names that appear in a piece of text (exact, case-aware words).
export function findNames(text) {
  const found = [];
  for (const o of OPCOS) for (const n of o.names) if (containsTerm(text, n) && !found.includes(n)) found.push(n);
  return found;
}

export function ruleCheck(topic, item, read, penalties = new Map()) {
  const c = { title: item.title, snippet: read.text || item.snippet, domain: item.domain, _matched: item.matched };
  const base = ruleScore(topic, c, penalties);
  const names = findNames(`${item.title}\n${read.text || item.snippet || ''}`);
  return {
    ...base,
    why: base.why + (names.length ? ` Names us: ${names.join(', ')}.` : ''),
    names_found: names,
    photo: read.images.length ? 'unchecked' : 'none',
    photo_note: '',
    exposure: names.length ? 'named' : 'not_named',
    scorer: 'rules',
  };
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
