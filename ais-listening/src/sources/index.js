// Every source returns a list of candidates:
// { url, title, snippet, source, publishedAt, platform, sourceType, contextInQuery }
// Sources never throw past `runSources`; failures are reported per source.

import { buildQuery } from '../filter.js';
import { parseRss } from './rss.js';
import { stripHtml, toIso, domainOf, truncate } from '../text.js';
import { BRAVE_SITES, MAX_PER_SOURCE } from '../../config/settings.js';

const UA = 'AIS-Social-Listening/1.0 (+internal marketing monitor)';

async function get(url, init = {}) {
  const res = await fetch(url, {
    ...init,
    headers: { 'User-Agent': UA, Accept: '*/*', ...(init.headers || {}) },
    signal: AbortSignal.timeout(12000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res;
}

function withinDays(iso, days) {
  if (!iso) return true;
  return Date.now() - new Date(iso).getTime() <= days * 86400000 + 3600000;
}

// --- Google News RSS (free, no key) ---------------------------------------
async function googleNews(topic, days) {
  const q = `${buildQuery(topic)} when:${days}d`;
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=en-US&gl=US&ceid=US:en`;
  const xml = await (await get(url)).text();
  return parseRss(xml, MAX_PER_SOURCE).map((it) => {
    const source = it.source || '';
    const title = source && it.title.endsWith(` - ${source}`) ? it.title.slice(0, -(source.length + 3)) : it.title;
    // Google's description is usually just the headline again; keep it only if it adds something.
    const snippet = it.description.replace(title, '').replace(source, '').trim();
    const useful = snippet.length > 25 ? snippet : '';
    return {
      url: it.link,
      title,
      snippet: useful,
      source: source || domainOf(it.sourceUrl),
      domain: domainOf(it.sourceUrl),
      publishedAt: toIso(it.pubDate),
      platform: 'Google News',
      sourceType: 'news',
      contextInQuery: true,
    };
  });
}

// --- Bing News RSS (free, no key) -----------------------------------------
async function bingNews(topic, days) {
  const url = `https://www.bing.com/news/search?q=${encodeURIComponent(buildQuery(topic))}&format=rss&count=50&setlang=en-us&cc=US`;
  const xml = await (await get(url)).text();
  return parseRss(xml, MAX_PER_SOURCE)
    .map((it) => {
      let link = it.link;
      try {
        const real = new URL(link).searchParams.get('url');
        if (real) link = real;
      } catch {}
      return {
        url: link,
        title: it.title,
        snippet: it.description,
        source: it.source || domainOf(link),
        domain: domainOf(link),
        publishedAt: toIso(it.pubDate),
        platform: 'Bing News',
        sourceType: 'news',
        contextInQuery: true,
      };
    });
}

// --- GDELT (free, no key; global news incl. small local outlets) -----------
async function gdelt(topic, days) {
  // GDELT rejects very short terms and doesn't support our exclude syntax;
  // excludes are applied locally by the rules filter instead.
  const q = `${buildQuery(topic, { includeExclude: false, minTermLength: 3 })} sourcelang:english`;
  const url = `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(q)}&mode=ArtList&format=json&maxrecords=${MAX_PER_SOURCE}&timespan=${days}d&sort=DateDesc`;
  let res = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(25000) });
  if (res.status === 429) {
    // GDELT allows one request every 5 seconds.
    await new Promise((r) => setTimeout(r, 6000));
    res = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(25000) });
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  if (!text.trim().startsWith('{')) throw new Error(truncate(text.trim(), 80) || 'empty response');
  const data = JSON.parse(text);
  return (data.articles || []).map((a) => ({
    url: a.url,
    title: stripHtml(a.title),
    snippet: '',
    source: a.domain,
    domain: domainOf(a.url),
    publishedAt: a.seendate ? toIso(a.seendate.replace(/^(\d{4})(\d\d)(\d\d)T(\d\d)(\d\d)(\d\d)Z$/, '$1-$2-$3T$4:$5:$6Z')) : null,
    platform: 'GDELT',
    sourceType: 'news',
    contextInQuery: true,
  }));
}

// --- Reddit (free; OAuth app recommended, else public JSON) ----------------
async function redditToken(env) {
  const res = await get('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${btoa(`${env.REDDIT_CLIENT_ID}:${env.REDDIT_CLIENT_SECRET}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  return (await res.json()).access_token;
}

async function reddit(topic, days, env) {
  const t = days <= 1 ? 'day' : days <= 7 ? 'week' : 'month';
  const q = buildQuery(topic, { includeContext: false, includeExclude: false });
  const path = `/search.json?q=${encodeURIComponent(q)}&sort=new&t=${t}&limit=${MAX_PER_SOURCE}&raw_json=1`;
  // Reddit blocks anonymous API access, so this source needs free app keys.
  const token = await redditToken(env);
  const res = await get(`https://oauth.reddit.com${path.replace('.json', '')}`, { headers: { Authorization: `Bearer ${token}` } });
  const data = await res.json();
  return (data?.data?.children || []).map(({ data: p }) => ({
    url: `https://www.reddit.com${p.permalink}`,
    title: p.title,
    snippet: truncate(p.selftext || '', 600),
    source: `r/${p.subreddit}`,
    domain: 'reddit.com',
    publishedAt: toIso(p.created_utc * 1000),
    platform: 'Reddit',
    sourceType: 'social',
    contextInQuery: false,
  }));
}

// --- Bluesky (free, no key) ------------------------------------------------
async function bluesky(topic, days) {
  const since = new Date(Date.now() - days * 86400000).toISOString();
  const out = [];
  for (const kw of topic.keywords.slice(0, 4)) {
    const q = /\s/.test(kw) ? `"${kw}"` : kw;
    const url = `https://api.bsky.app/xrpc/app.bsky.feed.searchPosts?q=${encodeURIComponent(q)}&sort=latest&limit=25&since=${encodeURIComponent(since)}&lang=en`;
    const data = await (await get(url, { headers: { Accept: 'application/json' } })).json();
    for (const p of data.posts || []) {
      const rkey = p.uri.split('/').pop();
      const text = p.record?.text || '';
      out.push({
        url: `https://bsky.app/profile/${p.author.handle}/post/${rkey}`,
        title: truncate(text.split('\n')[0], 140),
        snippet: truncate(text, 600),
        source: `@${p.author.handle}`,
        domain: 'bsky.app',
        publishedAt: toIso(p.record?.createdAt || p.indexedAt),
        platform: 'Bluesky',
        sourceType: 'social',
        contextInQuery: false,
      });
    }
  }
  return out;
}

// --- Brave web search (OPTIONAL, paid; finds public LinkedIn/Facebook pages) --
async function brave(topic, days, env) {
  const freshness = days <= 1 ? 'pd' : days <= 7 ? 'pw' : 'pm';
  const out = [];
  for (const site of BRAVE_SITES) {
    const q = `${buildQuery(topic, { includeContext: false })} site:${site}`;
    const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(q)}&count=20&freshness=${freshness}`;
    const data = await (await get(url, { headers: { 'X-Subscription-Token': env.BRAVE_API_KEY, Accept: 'application/json' } })).json();
    for (const r of data?.web?.results || []) {
      out.push({
        url: r.url,
        title: stripHtml(r.title),
        snippet: stripHtml(r.description),
        source: r.profile?.name || r.meta_url?.hostname || site,
        domain: domainOf(r.url),
        publishedAt: toIso(r.page_age) || null,
        platform: site.includes('linkedin') ? 'LinkedIn' : site.includes('facebook') ? 'Facebook' : 'Web',
        sourceType: 'social',
        contextInQuery: false,
      });
    }
  }
  return out;
}

export function enabledSources(env) {
  const list = [
    ['Google News', googleNews],
    ['Bing News', bingNews],
    ['GDELT', gdelt],
    ['Bluesky', bluesky],
  ];
  if (env.REDDIT_CLIENT_ID && env.REDDIT_CLIENT_SECRET) list.push(['Reddit', reddit]);
  if (env.BRAVE_API_KEY) list.push(['LinkedIn/Facebook (Brave)', brave]);
  const disabled = String(env.DISABLED_SOURCES || '').split(',').map((s) => s.trim()).filter(Boolean);
  return list.filter(([name]) => !disabled.includes(name));
}

export async function runSources(topic, days, env) {
  const sources = enabledSources(env);
  const settled = await Promise.allSettled(sources.map(([, fn]) => fn(topic, days, env)));
  const candidates = [];
  const report = {};
  settled.forEach((r, i) => {
    const name = sources[i][0];
    if (r.status === 'fulfilled') {
      // Engines don't always honor their date filters, so enforce the lookback here.
      const valid = r.value.filter((c) => c.url && c.title && withinDays(c.publishedAt, days + 1));
      candidates.push(...valid.slice(0, MAX_PER_SOURCE * 2));
      report[name] = valid.length;
    } else {
      report[name] = `error: ${truncate(r.reason?.message || String(r.reason), 100)}`;
    }
  });
  return { candidates, report };
}
