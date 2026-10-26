// =============================================================================
// AIS Social Listening — EDITABLE SETTINGS
// =============================================================================
// This is the one file to change OpCo brand colors, the scan schedule and the
// relevance threshold. After editing, run `npm run deploy` to publish.
// Topics (keywords, context terms, exclude terms) are edited in the dashboard.
// =============================================================================

export const BRAND = {
  name: 'AIS',
  appTitle: 'AIS Social Listening',
  primary: '#004C9D', // AIS blue
  primaryDark: '#003570',
  silver: '#A7B1BC',
  gray: '#5F6B78',
};

// One entry per operating company. `code` is what topics are tagged with.
// Replace any color marked PLACEHOLDER with the exact brand hex.
//
// `names`: how the company appears in print. A story that contains one of these
// "names us". Short ALL-CAPS names (AIS, RSI) only count as exact, capitalized
// words, and the relevance check still confirms it's really us.
// `logo`: what the logo / equipment branding looks like, so the photo check
// knows what to look for. Optional `logoFile`: a PNG of the logo placed in
// public/logos/ (e.g. 'aisi.png'); when present it is shown to the photo check.
export const OPCOS = [
  {
    code: 'AISI', name: 'AIS Infrastructure', color: '#F2B705', // gold/yellow — confirm exact hex
    names: ['AIS Infrastructure', 'AISI'],
    // Confirmed: equipment typically says "AIS Infrastructure" or carries the logo.
    logo: 'equipment, trucks, signs or hard hats marked with the words "AIS Infrastructure" or the AIS Infrastructure logo (colors to confirm; add logoFile for the exact mark)',
    logoFile: null,
  },
  {
    code: 'NWDD', name: 'Northwest Demolition', color: '#C8102E', // red — confirm exact hex
    names: ['Northwest Demolition', 'NWDD', 'Northwest Demolition and Dismantling', 'Northwest Demolition & Dismantling'],
    logo: '"NWDD" or "Northwest Demolition", red', // CONFIRM
    logoFile: null,
  },
  {
    code: 'FDT', name: 'F.D. Thomas', color: '#6C4BB6', // PLACEHOLDER — need brand hex
    names: ['F.D. Thomas', 'FD Thomas', 'F. D. Thomas', 'FDThomas'],
    logo: '"F.D. Thomas" or "FDT"', // CONFIRM
    logoFile: null,
  },
  {
    code: 'RSI', name: 'RSI', color: '#2E8B3E', // green — confirm exact hex
    names: ['RSI'],
    logo: '"RSI", green', // CONFIRM
    logoFile: null,
  },
  {
    code: 'AIS', name: 'AIS (corporate / shared)', color: '#004C9D',
    names: ['AIS', 'ASRC Industrial', 'ASRC Industrial Services', 'BCCG'],
    logo: 'the letters "AIS" in blue (#004C9D)', // CONFIRM
    logoFile: null,
  },
];

// Scans run at these hours, Pacific time (24h clock). Default: 7 AM and 7 PM.
export const SCAN_HOURS_PACIFIC = [7, 19];
export const TIMEZONE = 'America/Los_Angeles';

// Results scoring below this (0–100) are hidden unless "Show low-confidence" is on.
export const RELEVANCE_THRESHOLD = 60;

// Claude model used for the relevance, sentiment, name and photo check. The
// small, fast model keeps cost around $2–4/month at this volume. 'claude-opus-5-5' is the most
// accurate option (roughly $15–25/month at this volume).
export const RELEVANCE_MODEL = 'claude-haiku-5-5';

// How far back to search: a topic's very first scan looks back further.
export const LOOKBACK_DAYS = { firstScan: 30, regular: 3 };

// Max results kept per source per topic per scan (protects cost and limits).
export const MAX_PER_SOURCE = 40;

// Optional paid web search (Brave) — only used if BRAVE_API_KEY is set.
// Each entry is one query per topic per scan. ~$5 per 1,000 queries after
// Brave's $5/month free credit. 12 topics × 2 queries × 60 scans ≈ 1,440/month.
export const BRAVE_SITES = ['linkedin.com', 'facebook.com'];

// After a scan finds new results, each one is opened to read the full article
// and check its photos. This many are checked per Worker run (keep it small on
// Cloudflare's free plan; 6+ is fine on the $5/month plan).
export const CHECK_BATCH = 2;
// Photos checked per result (the lead photo first).
export const MAX_PHOTOS = 3;
