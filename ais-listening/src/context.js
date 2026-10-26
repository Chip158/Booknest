// Links OpCos and their jobs so each search and check knows the full picture:
// - an OpCo topic also looks for its projects/locations (e.g. AIS Infrastructure
//   + border wall, Cabeza Prieta, Lukeville…), so "AIS Infrastructure … border
//   wall" counts while "AI infrastructure" doesn't;
// - a project topic also accepts its OpCo's names as context.
// Nothing here is stored: it's rebuilt from the current topics on every scan,
// so adding a project in the dashboard immediately widens its OpCo's search.

import { OPCOS } from '../config/settings.js';

const uniq = (list) => [...new Set(list.filter(Boolean))];

export function linkTopic(topic, allTopics) {
  const opco = OPCOS.find((o) => o.code === topic.opco);
  const jobs = allTopics.filter((t) => t.opco === topic.opco && t.type !== 'opco' && !t.paused && t.id !== topic.id);
  const linked = { ...topic, opcoProfile: opco || null, jobs };
  if (topic.type === 'opco') {
    // Job keywords first, so they survive the search-query length cap.
    linked.context = uniq([...jobs.flatMap((j) => j.keywords), ...topic.context]);
  } else {
    linked.context = uniq([...topic.context, ...(opco?.names || [])]);
  }
  return linked;
}

// Text for the relevance check: who the company is and what it's working on.
export function profileText(topic) {
  const o = topic.opcoProfile;
  if (!o) return '';
  const lines = [`ABOUT ${o.name.toUpperCase()} (${o.code})`];
  if (o.about) lines.push(o.about);
  lines.push(`Appears in print as: ${o.names.join('; ')}`);
  if (topic.jobs?.length) {
    lines.push('Current projects / locations:');
    for (const j of topic.jobs) lines.push(`- ${j.name} (${j.keywords.join(', ')})${j.context.length ? `: ${j.context.slice(0, 8).join(', ')}` : ''}`);
  }
  return lines.join('\n');
}
