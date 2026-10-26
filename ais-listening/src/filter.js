// Rule-based accuracy gate. Runs on every candidate before the relevance check.
//
// A result counts only if it mentions a topic keyword AND at least one context
// term, and none of the exclude terms.
//
// Full-text search engines (Google News, Bing News, GDELT, Brave) receive the
// context terms inside the search query, so the engine has already checked the
// article body. Their RSS snippets are often just the headline, so for those we
// accept "context matched by search engine" when the snippet itself is too short
// to show it. Social posts are matched locally on their full text.

import { matchedTerms } from './text.js';

export function applyRules(topic, candidate) {
  const text = `${candidate.title}\n${candidate.snippet || ''}`;
  const excluded = matchedTerms(text, topic.exclude);
  if (excluded.length) return { ok: false, reason: 'excluded', excluded };

  const keywords = matchedTerms(text, topic.keywords);
  const context = matchedTerms(text, topic.context);
  // Name-only search result: context is required in the full article instead.
  if (candidate.contextInQuery === 'full-article') {
    return { ok: true, matched: { keywords, context, via: context.length ? 'text' : 'full article (checked when read)' } };
  }
  const engineChecked = candidate.contextInQuery === true;

  // Keyword must be visible locally, unless the engine matched on full text.
  if (!keywords.length && !engineChecked) return { ok: false, reason: 'no_keyword' };
  if (topic.context.length && !context.length && !engineChecked) return { ok: false, reason: 'no_context' };

  return {
    ok: true,
    matched: {
      keywords,
      context,
      via: context.length ? 'text' : topic.context.length ? 'search engine (full article)' : 'no context terms set',
    },
  };
}

// Builds a boolean query: ("kw1" OR "kw2") ("ctx1" OR ctx2) -"ex1"
export function buildQuery(topic, { includeContext = true, includeExclude = true, maxContext = 7, contextFrom = 0, minTermLength = 1 } = {}) {
  const q = (t) => (/\s|[^\w]/.test(t) ? `"${t.replace(/"/g, '')}"` : t);
  const kws = topic.keywords.filter((t) => t.length >= minTermLength).map(q);
  const parts = [kws.length > 1 ? `(${kws.join(' OR ')})` : kws[0] || ''];
  const ctx = topic.context.filter((t) => t.length >= minTermLength).slice(contextFrom, contextFrom + maxContext).map(q);
  if (includeContext && ctx.length) parts.push(ctx.length > 1 ? `(${ctx.join(' OR ')})` : ctx[0]);
  if (includeExclude) for (const ex of topic.exclude) parts.push(`-${q(ex)}`);
  return parts.filter(Boolean).join(' ');
}

// Search engines silently return nothing for long queries, so a long context
// list is split into several short searches whose results are merged.
export function buildQueries(topic, { chunk = 7, maxChunks = 4, ...opts } = {}) {
  const n = Math.max(1, Math.min(maxChunks, Math.ceil(topic.context.length / chunk)));
  return Array.from({ length: n }, (_, i) => buildQuery(topic, { ...opts, maxContext: chunk, contextFrom: i * chunk }));
}
