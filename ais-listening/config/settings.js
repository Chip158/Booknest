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
// `about`: one or two sentences on what the company does and where. Its current
// jobs don't go here: every project/location topic tagged with the OpCo in the
// dashboard is added automatically.
// `logo`: what the logo / equipment branding looks like, so the photo check
// knows what to look for. Optional `logoFile`: a PNG of the logo placed in
// public/logos/ (e.g. 'aisi.png'); when present it is shown to the photo check.
export const OPCOS = [
  // ---- Companies confirmed with the team (colors partly confirmed)
  {
    code: 'AISI', name: 'AIS Infrastructure', color: '#F2B705', // gold/yellow — confirm exact hex
    about: 'Heavy civil construction and sitework contractor (Chattanooga, Tennessee; Blairsville, Georgia), working across the Southeast. Builds U.S. border wall / tactical infrastructure in Arizona and California, including in the BCCG joint venture. Divisions: AIS BCSS (site development, heavy civil), AIS Cerrudo (civil construction, tactical infrastructure, environmental services, material supply), AIS FDTWI (infrastructure maintenance and repair, waterline rehabilitation).',
    names: ['AIS Infrastructure', 'AISI', 'AIS BCSS', 'AIS Cerrudo', 'AIS FDTWI'],
    // Confirmed: equipment typically says "AIS Infrastructure" or carries the logo.
    logo: 'equipment, trucks, signs or hard hats marked with the words "AIS Infrastructure" or the AIS Infrastructure logo (colors to confirm; add logoFile for the exact mark)',
    logoFile: null,
  },
  {
    code: 'NWDD', name: 'Northwest Demolition', color: '#C8102E', // red — confirm exact hex
    about: 'Demolition and dismantling contractor (Pacific Northwest), including large structures such as stadiums.', // CONFIRM
    names: ['Northwest Demolition', 'NWDD', 'Northwest Demolition and Dismantling', 'Northwest Demolition & Dismantling'],
    logo: '"NWDD" or "Northwest Demolition", red', // CONFIRM
    logoFile: null,
  },
  {
    code: 'FDT', name: 'F.D. Thomas', color: '#6C4BB6', // PLACEHOLDER — need brand hex
    about: 'Industrial painting, coatings and structural specialties contractor (Central Point, Oregon; offices in Washington, California, Maryland, Alaska, Tennessee), including bridges. Includes F.D. Thomas Structural Specialties and D. Zelinsky & Sons.',
    names: ['F.D. Thomas', 'FD Thomas', 'F. D. Thomas', 'FDThomas', 'F.D. Thomas Structural Specialties', 'D. Zelinsky & Sons', 'D. Zelinsky'],
    logo: '"F.D. Thomas" or "FDT"', // CONFIRM
    logoFile: null,
  },
  {
    code: 'RSI', name: 'RSI', color: '#2E8B3E', // green — confirm exact hex
    about: 'Group of environmental remediation and waste management companies (Oak Ridge, Tennessee), including Navy shipyard cleanup; acquired Sigma Science, Inc.', // CONFIRM full name
    names: ['RSI', 'RSI EnTech', 'Sigma Science'],
    logo: '"RSI", green', // CONFIRM
    logoFile: null,
  },
  // ---- Other operating companies (from asrcindustrial.com/our-companies).
  // Colors are PLACEHOLDERS until the team supplies brand hex codes.
  { code: 'API', name: 'Arctic Pipe Inspection', color: '#1F6F8B', about: 'Pipe inspection services for the oil and gas industry (Houston, Texas).', names: ['Arctic Pipe Inspection'], logo: '"Arctic Pipe Inspection"', logoFile: null },
  { code: 'ATI', name: 'Arctic Testing & Inspection', color: '#3E8EC4', about: 'Asset integrity testing and inspection (La Porte, Texas).', names: ['Arctic Testing & Inspection', 'Arctic Testing and Inspection', 'Arctic Testing'], logo: '"Arctic Testing"', logoFile: null },
  { code: 'PITCO', name: 'Pitco', color: '#5B6770', about: 'MFL inspection systems for OCTG tubing and casing, serving the oil and gas industry (Houston, Texas).', names: ['Pitco LLC'], logo: '"Pitco"', logoFile: null },
  { code: 'D2', name: 'D2 Industrial Services', color: '#8C5E3C', about: 'Industrial services contractor (California: Rancho Cucamonga, Vallejo).', names: ['D2 Industrial Services', 'D2 Industrial'], logo: '"D2 Industrial"', logoFile: null },
  { code: 'EQM', name: 'Environmental Quality Management', color: '#4E9A6B', about: 'Environmental engineering, consulting and remediation services (Cincinnati, Ohio). Includes EQM Services.', names: ['Environmental Quality Management', 'EQM Services', 'EQM'], logo: '"EQM"', logoFile: null },
  { code: 'GCI', name: 'Gulf Coast Industrial', color: '#C0702A', about: 'Industrial services (Gulf Coast: Richwood, Texas; Pensacola, Florida; Augusta, Georgia).', names: ['AIS Gulf Coast Industrial', 'Gulf Coast Industrial'], logo: '"Gulf Coast Industrial"', logoFile: null },
  { code: 'HUD', name: 'Hudspeth & Associates', color: '#7A4E9C', about: 'Remediation and industrial services (Centennial, Colorado).', names: ['Hudspeth & Associates', 'Hudspeth and Associates'], logo: '"Hudspeth"', logoFile: null },
  { code: 'K2', name: 'K2 Industrial Services', color: '#2C4F7C', about: 'Industrial cleaning services (also known as KM Plant Services).', names: ['K2 Industrial Services', 'K2 Industrial', 'KM Plant Services'], logo: '"K2 Industrial"', logoFile: null },
  { code: 'MAVO', name: 'Mavo Systems', color: '#B5452F', about: 'Abatement, demolition and concrete sawing (White Bear Lake, Minnesota; Wisconsin). Includes Mavo Concrete Sawing.', names: ['Mavo Systems', 'Mavo Concrete Sawing', 'Mavo'], logo: '"Mavo"', logoFile: null },
  { code: 'NEG', name: 'National Environmental Group', color: '#5C8A2E', about: 'Environmental remediation and waste management (Flint Township, Michigan).', names: ['National Environmental Group'], logo: '"National Environmental Group" or "NEG"', logoFile: null },
  { code: 'NILES', name: 'Niles Construction Services', color: '#8A6D1C', about: 'Painting and coatings services to industrial, manufacturing, automation and utility customers.', names: ['Niles Construction Services', 'Niles Construction'], logo: '"Niles Construction"', logoFile: null },
  { code: 'PETRO', name: 'Petrochem', color: '#A23B72', about: 'Insulation, scaffolding, metal structures, and painting & coatings (Vancouver, Washington; White City, Oregon; Indiana; Pennsylvania).', names: ['Petrochem Insulation', 'Petrochem Inc', 'Petrochem'], logo: '"Petrochem"', logoFile: null },
  { code: 'REDWOOD', name: 'Redwood Painting', color: '#9E2A2B', about: 'Industrial painting and specialty trade services since 1947 (Pittsburg, California).', names: ['Redwood Painting'], logo: '"Redwood Painting"', logoFile: null },
  { code: 'USC', name: 'US Coatings', color: '#386FA4', about: 'Industrial painting and coatings contractor.', names: ['US Coatings LLC', 'U.S. Coatings LLC'], logo: '"US Coatings"', logoFile: null },
  { code: 'USCF', name: 'US Coatings Federal', color: '#2A5D8F', about: 'SBA 8(a) industrial painting contractor serving the federal government and marine markets.', names: ['US Coatings Federal', 'U.S. Coatings Federal', 'USCF'], logo: '"US Coatings Federal" or "USCF"', logoFile: null },
  {
    code: 'AIS', name: 'AIS (corporate / shared)', color: '#004C9D',
    about: 'AIS (ASRC Industrial Services, LLC; Tempe, Arizona) is the parent company of the OpCos above and a subsidiary of Arctic Slope Regional Corporation (ASRC).',
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
