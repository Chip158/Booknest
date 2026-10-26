// Text helpers shared by the filter, dedupe and sources. Pure functions only.

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', '#39': "'" };

export function decodeEntities(s) {
  return String(s ?? '')
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z0-9#]+);/gi, (m, n) => ENTITIES[n.toLowerCase()] ?? m);
}

export function stripHtml(s) {
  // Feeds often HTML-escape their HTML, so strip tags both before and after decoding.
  const tags = /<\/?[a-z][^>]*>/gi;
  return decodeEntities(decodeEntities(String(s ?? '').replace(tags, ' ')).replace(tags, ' '))
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Short all-caps terms (AISI, RSI, NWDD, AI) are acronyms: match them
// case-sensitively so "Rsi" or "ai" inside other words never count.
export function isAcronym(term) {
  return /^[A-Z0-9&.]{2,6}$/.test(term.trim());
}

const termCache = new Map();
function termRegex(term) {
  let re = termCache.get(term);
  if (!re) {
    const t = term.trim();
    // Treat spaces, hyphens and dashes as interchangeable inside phrases.
    const body = t.split(/[\s\-–—]+/).map(escapeRegex).join('[\\s\\-–—]+');
    re = new RegExp(`(?<![\\p{L}\\p{N}])${body}(?![\\p{L}\\p{N}])`, isAcronym(t) ? 'u' : 'iu');
    termCache.set(term, re);
  }
  return re;
}

export function containsTerm(text, term) {
  if (!term || !term.trim()) return false;
  return termRegex(term).test(text);
}

export function matchedTerms(text, terms) {
  return (terms || []).filter((t) => containsTerm(text, t));
}

const STOP = new Set('a an the and or of to in on for at by with from as is are was were be after over new says said its it this that'.split(' '));

// Normalize a headline for dedupe: drop " - Outlet" suffix, punctuation, stop words.
export function titleKey(title) {
  return String(title || '')
    .replace(/\s+[-–—|]\s+[^-–—|]{2,60}$/, '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((w) => w && !STOP.has(w))
    .join(' ');
}

export function jaccard(a, b) {
  const A = new Set(a.split(' ').filter(Boolean));
  const B = new Set(b.split(' ').filter(Boolean));
  if (!A.size || !B.size) return 0;
  let inter = 0;
  for (const w of A) if (B.has(w)) inter++;
  return inter / (A.size + B.size - inter);
}

const TRACKING = /^(utm_|fbclid|gclid|mc_|ref$|ref_src|cmpid|ocid|taid|smid)/i;

export function canonicalUrl(raw) {
  try {
    const u = new URL(raw);
    u.hash = '';
    for (const k of [...u.searchParams.keys()]) if (TRACKING.test(k)) u.searchParams.delete(k);
    u.hostname = u.hostname.replace(/^www\.|^m\./, '');
    return u.toString().replace(/\/$/, '');
  } catch {
    return String(raw || '');
  }
}

export function domainOf(raw) {
  try {
    return new URL(raw).hostname.replace(/^www\.|^m\./, '');
  } catch {
    return '';
  }
}

export async function sha(text, len = 24) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, len);
}

export function toIso(d) {
  const t = d instanceof Date ? d : new Date(d);
  return Number.isNaN(t.getTime()) ? null : t.toISOString();
}

export function truncate(s, n) {
  s = String(s || '');
  return s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s;
}
