// Opens a result's page to read the full text and collect its photos, so the
// check can tell whether we're named in the copy or visible in a picture.
// Every step is best-effort: if a site blocks us, the result is still scored
// on its headline/snippet and marked "article text not checked".

import { MAX_PHOTOS } from '../config/settings.js';
import { decodeEntities } from './text.js';

const UA = 'Mozilla/5.0 (compatible; AIS-Social-Listening/1.0)';
const MAX_TEXT = 12000;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// Google News RSS links point at news.google.com, not the publisher. Google's
// own article page carries a signature that its batchexecute endpoint trades
// for the real URL. Google throttles this, so we pace and retry once.
export async function resolveGoogleNews(link) {
  const id = new URL(link).pathname.split('/').pop();
  const page = await fetch(`https://news.google.com/rss/articles/${id}`, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(10000) });
  if (!page.ok) throw new Error(`Google News page HTTP ${page.status}`);
  const html = await page.text();
  const sg = html.match(/data-n-a-sg="([^"]+)"/)?.[1];
  const ts = html.match(/data-n-a-ts="([^"]+)"/)?.[1];
  if (!sg || !ts) throw new Error('Google News signature not found');
  const req = [[['Fbv4je', `["garturlreq",[["X","X",["X","X"],null,null,1,1,"US:en",null,1,null,null,null,null,null,0,1],"X","X",1,[1,1,1],1,1,null,0,0,null,0],"${id}",${ts},"${sg}"]`, null, 'generic']]];
  for (let attempt = 0; attempt < 2; attempt++) {
    const res = await fetch('https://news.google.com/_/DotsSplashUi/data/batchexecute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8', 'User-Agent': UA },
      body: `f.req=${encodeURIComponent(JSON.stringify(req))}`,
      signal: AbortSignal.timeout(10000),
    });
    if (res.status === 429 && attempt === 0) {
      await wait(4000);
      continue;
    }
    if (!res.ok) throw new Error(`Google News decode HTTP ${res.status}`);
    const url = (await res.text()).match(/garturlres\\",\\"(.*?)\\"/)?.[1];
    if (!url) throw new Error('Google News decode returned no URL');
    return JSON.parse(`"${url}"`); // unescape & etc.
  }
  throw new Error('Google News decode rate-limited');
}

function absolute(src, base) {
  try {
    const u = new URL(decodeEntities(src.trim()), base);
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.href : null;
  } catch {
    return null;
  }
}

// Skip icons, avatars, tracking pixels and ads; keep likely news photos.
const JUNK_IMG = /(logo|icon|avatar|sprite|pixel|badge|placeholder|blank|spacer|1x1|favicon|emoji|ads?[/_-]|doubleclick|gravatar|\.svg($|\?)|\.gif($|\?))/i;

export async function fetchArticle(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'text/html,application/xhtml+xml' },
    redirect: 'follow',
    signal: AbortSignal.timeout(12000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  if (!(res.headers.get('Content-Type') || '').includes('html')) throw new Error('not an HTML page');

  const finalUrl = res.url || url;
  const lead = [];
  const body = [];
  const parts = [];
  let len = 0;
  let skip = 0; // depth inside script/style/nav/footer/aside
  const keepText = { text(t) { if (!skip && len < MAX_TEXT) { parts.push(t.text); len += t.text.length; } } };
  const block = {
    element(el) {
      if (!skip && len < MAX_TEXT) parts.push('\n');
    },
  };
  const skipper = {
    element(el) {
      skip++;
      el.onEndTag(() => { skip--; });
    },
  };

  // HTMLRewriter streams the page through Cloudflare's native parser (cheap on CPU).
  const rewritten = new HTMLRewriter()
    .on('meta[property="og:image"], meta[name="twitter:image"], meta[property="og:image:secure_url"]', {
      element(el) { const u = absolute(el.getAttribute('content') || '', finalUrl); if (u) lead.push(u); },
    })
    .on('script, style, noscript, nav, footer, aside, header, form, svg, iframe, button', skipper)
    // All body text, not just <p>: project credits and contractor lists often
    // sit in <div>/<strong>/<td> blocks (e.g. ENR "Subcontractors: … FD Thomas").
    .on('h1, h2, h3, h4, p, li, figcaption, blockquote, div, section, article, tr, dd, dt, br', block)
    .on('body', keepText)
    .on('article img, figure img, main img', {
      element(el) {
        const src = el.getAttribute('src') || el.getAttribute('data-src') || (el.getAttribute('srcset') || '').split(/\s+/)[0];
        const w = Number(el.getAttribute('width') || 0);
        const u = src && absolute(src, finalUrl);
        if (u && !JUNK_IMG.test(u) && (!w || w >= 200)) body.push(u);
      },
    })
    .transform(res);
  await rewritten.text();

  const text = decodeEntities(parts.join('')).replace(/[ \t]+/g, ' ').replace(/\n\s*\n+/g, '\n').trim().slice(0, MAX_TEXT);
  const images = [...new Set([...lead, ...body])].filter((u) => !JUNK_IMG.test(u)).slice(0, MAX_PHOTOS);
  return { url: finalUrl, text, images };
}

// Full check input for one stored result.
export async function readResult(item) {
  const out = { url: item.url, text: '', images: JSON.parse(item.images || '[]'), textChecked: false, note: '' };
  // Social posts already carry their full text and photos.
  if (item.source_type === 'social' && item.platform !== 'LinkedIn' && item.platform !== 'Facebook') {
    out.text = item.snippet || '';
    out.textChecked = true;
    return out;
  }
  try {
    let url = item.url;
    if (item.platform === 'Google News' && new URL(url).hostname === 'news.google.com') url = await resolveGoogleNews(url);
    out.url = url;
    const page = await fetchArticle(url);
    out.url = page.url;
    out.text = page.text;
    out.images = [...new Set([...out.images, ...page.images])].slice(0, MAX_PHOTOS);
    out.textChecked = page.text.length > 200;
    if (!out.textChecked) out.note = 'page had little readable text';
  } catch (err) {
    out.note = `couldn't open article (${err.message})`;
  }
  return out;
}
