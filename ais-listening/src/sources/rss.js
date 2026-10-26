import { decodeEntities, stripHtml } from '../text.js';

function tag(block, name) {
  const m = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, 'i'));
  if (!m) return '';
  return m[1].replace(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/, '$1').trim();
}

function attr(block, name, attribute) {
  const m = block.match(new RegExp(`<${name}\\s[^>]*${attribute}="([^"]*)"`, 'i'));
  return m ? decodeEntities(m[1]) : '';
}

// Minimal RSS 2.0 parser — enough for Google News and Bing News feeds.
export function parseRss(xml, limit = 100) {
  const out = [];
  const re = /<item[\s>][\s\S]*?<\/item>/gi;
  let m;
  while ((m = re.exec(xml)) && out.length < limit) {
    const b = m[0];
    out.push({
      title: stripHtml(tag(b, 'title')),
      link: decodeEntities(tag(b, 'link')),
      description: stripHtml(tag(b, 'description')),
      pubDate: tag(b, 'pubDate'),
      source: stripHtml(tag(b, 'source')) || stripHtml(tag(b, 'News:Source')),
      sourceUrl: attr(b, 'source', 'url'),
    });
  }
  return out;
}
