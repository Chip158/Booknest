// Starting topics. These are loaded into the database the first time the app
// runs; after that, add/edit/pause/remove topics in the dashboard.
//
// keywords      – the topic must match at least one of these
// context       – AND at least one of these (proves it's about our work)
// exclude       – drop the result if any of these appear
// confirm       – open questions to confirm with leadership (shown in the UI)
//
// Matching notes: short ALL-CAPS acronyms (AISI, NWDD, RSI, BCCG…) are matched
// case-sensitively as whole words so "rsi" in a URL or "Aisi" don't count.

export const SEED_TOPICS = [
  // ---------------------------------------------------------------- OpCos
  {
    name: 'AIS Infrastructure (AISI)',
    opco: 'AISI',
    type: 'opco',
    keywords: ['AIS Infrastructure', 'AISI'],
    context: ['construction', 'heavy civil', 'Chattanooga', 'Tennessee', 'ASRC', 'Blairsville', 'Georgia', 'contractor', 'border wall', 'infrastructure project'],
    exclude: ['artificial intelligence', 'AI', 'machine learning', 'maritime', 'ship tracking', 'vessel tracking', 'Automatic Identification System', 'American Iron and Steel Institute', 'stainless steel grade'],
    confirm: [
      '"AISI" also means the American Iron and Steel Institute and steel grades (e.g. "AISI 304"). Those are excluded — OK?',
      'Excluding the bare word "AI" may drop a real story that mentions AI in passing (e.g. "contractor adopts AI tools"). Keep it, or rely on the relevance check instead?',
      'Is "ASRC Industrial" ever used in AISI press (should it be a keyword)?',
    ],
  },
  {
    name: 'Northwest Demolition (NWDD)',
    opco: 'NWDD',
    type: 'opco',
    keywords: ['Northwest Demolition', 'NWDD', 'Northwest Demolition and Dismantling', 'Northwest Demolition & Dismantling'],
    context: ['demolition', 'dismantling', 'implosion', 'contractor', 'Oregon', 'Portland', 'Hawaii', 'Aloha Stadium', 'ASRC', 'AIS', 'abatement'],
    exclude: [],
    confirm: [
      'Confirm the legal name ("Northwest Demolition & Dismantling"?) and HQ city so it can be added as context.',
      '"Northwest" + "demolition" is generic; a local news story about any demolition in the Pacific Northwest could match. The relevance check handles this, but more exclude terms may be needed after the first scans.',
    ],
  },
  {
    name: 'F.D. Thomas (FDT)',
    opco: 'FDT',
    type: 'opco',
    keywords: ['F.D. Thomas', 'FD Thomas', 'F. D. Thomas', 'FDThomas'],
    context: ['coatings', 'painting', 'bridge', 'Bay Bridge', 'Central Point', 'Oregon', 'contractor', 'industrial', 'ASRC', 'AIS', 'Caltrans'],
    exclude: [],
    confirm: [
      'Bare "FDT" is NOT used as a keyword (too many unrelated meanings). OK?',
      'Confirm HQ location (Central Point, Oregon?) and main service lines (industrial coatings / painting?).',
      'There may be people named "F.D. Thomas" (authors, obituaries). Watch the first scans.',
    ],
  },
  {
    name: 'RSI',
    opco: 'RSI',
    type: 'opco',
    keywords: ['RSI'],
    context: ['remediation', 'environmental', 'Hunters Point', 'shipyard', 'Navy', 'cleanup', 'ASRC', 'AIS', 'contractor', 'radiological'],
    exclude: ['Relative Strength Index', 'repetitive strain', 'repetitive stress', 'overbought', 'oversold', 'stock', 'shares', 'RSI indicator', 'RSI Lugano', 'Radiotelevisione', 'rapid sequence intubation'],
    confirm: [
      'HIGH PRIORITY: what does RSI stand for (full legal name)? "RSI" alone collides with stock-chart indicators, injuries and Swiss TV. Adding the full name as a keyword will greatly improve accuracy.',
      'Confirm RSI\'s service lines and HQ so they can be added as context terms.',
    ],
  },

  // ------------------------------------------------------ Projects / places
  {
    name: 'Cabeza Prieta',
    opco: 'AISI',
    type: 'project',
    keywords: ['Cabeza Prieta'],
    context: ['border wall', 'border barrier', 'wall', 'barrier', 'construction', 'contractor', 'wildlife refuge', 'Arizona', 'AIS', 'ASRC', 'BCCG', 'CBP', 'Border Patrol'],
    exclude: ['hunting season', 'bighorn sheep hunt'],
    confirm: [
      'Which OpCo? Tagged AIS Infrastructure (border work) — confirm.',
      'Environmental coverage of the refuge that doesn\'t mention the contractor will still be included if it\'s about the wall work — that\'s where negative press usually starts. OK?',
    ],
  },
  {
    name: 'Las Playas Intaglio',
    opco: 'AISI',
    type: 'project',
    keywords: ['Las Playas Intaglio', 'Las Playas intaglios', 'Las Playas geoglyph'],
    context: ['border', 'wall', 'barrier', 'construction', 'damage', 'Arizona', 'archaeological', 'cultural', 'Tohono O\'odham', 'contractor', 'AIS', 'CBP'],
    exclude: [],
    confirm: [
      'Which OpCo? Tagged AIS Infrastructure — confirm.',
      'Confirm the location (Arizona border, near Cabeza Prieta?).',
    ],
  },
  {
    name: 'Border Wall – Lukeville, Tecate, Tijuana',
    opco: 'AISI',
    type: 'project',
    keywords: ['Lukeville', 'Tecate', 'Tijuana'],
    context: ['border wall', 'border barrier', 'border fence', 'wall construction', 'secondary wall', 'contractor', 'AIS', 'ASRC', 'BCCG', 'CBP'],
    exclude: ['Tecate beer', 'cerveza', 'Tecate Light', 'Xolos', 'Tijuana Xolos', 'restaurant review'],
    confirm: [
      'Which OpCo? Tagged AIS Infrastructure — confirm.',
      'Tijuana border-wall coverage is very high volume and mostly not about our segment. Do you want general coverage of these wall sections, or only stories naming AIS/BCCG/our contract?',
      'Should these be three separate topics so each location can be filtered on its own?',
    ],
  },
  {
    name: 'Tecate Peak',
    opco: 'AISI',
    type: 'location',
    keywords: ['Tecate Peak'],
    context: ['border', 'wall', 'barrier', 'road', 'construction', 'contractor', 'blasting', 'AIS', 'CBP', 'Otay Mountain'],
    exclude: ['hiking trail', 'trail report'],
    confirm: ['Which OpCo? Tagged AIS Infrastructure — confirm.'],
  },
  {
    name: 'BCCG JV',
    opco: 'AISI',
    type: 'project',
    keywords: ['BCCG', 'BCSS', 'Caddell Construction', 'Caddell'],
    context: ['joint venture', 'JV', 'border', 'wall', 'barrier', 'contract', 'CBP', 'AIS Infrastructure', 'Gibraltar', 'construction'],
    exclude: ['Strait of Gibraltar', 'Rock of Gibraltar', 'Gibraltar football', 'embassy'],
    confirm: [
      'Confirm the full JV name and what BCSS stands for.',
      '"Gibraltar" alone is a country, so it is used only as a context term, not a keyword. Is the partner "Gibraltar Construction"? If so it can be a keyword.',
      'Caddell builds embassies worldwide; "embassy" is excluded to cut that noise. OK?',
    ],
  },
  {
    name: 'Aloha Stadium (NWDD)',
    opco: 'NWDD',
    type: 'project',
    keywords: ['Aloha Stadium', 'New Aloha Stadium', 'NASED', 'Halawa stadium'],
    context: ['demolition', 'dismantling', 'Northwest Demolition', 'NWDD', 'contractor', 'implosion', 'teardown', 'deconstruction', 'stadium site'],
    exclude: ['swap meet', 'concert tickets'],
    confirm: ['Is the new stadium development (NASED) relevant, or only the demolition?'],
  },
  {
    name: 'Bay Bridge (FDT)',
    opco: 'FDT',
    type: 'project',
    keywords: ['Bay Bridge'],
    context: ['painting', 'coatings', 'F.D. Thomas', 'FD Thomas', 'contractor', 'Caltrans', 'maintenance', 'repaint', 'lane closure', 'Oakland', 'San Francisco'],
    exclude: ['Chesapeake', 'Maryland', 'Bay Bridge-Tunnel', 'Bay Bridge Series', 'Bay Bridge Bowl'],
    confirm: [
      'Confirm this is the San Francisco–Oakland Bay Bridge (the Maryland and Virginia bridges are excluded).',
      'Traffic crashes on the Bay Bridge will match "Oakland/San Francisco". Want those (e.g. crash in a work zone) or only work/contract news?',
    ],
  },
  {
    name: 'Hunters Point (RSI)',
    opco: 'RSI',
    type: 'project',
    keywords: ['Hunters Point', 'Hunters Point Naval Shipyard', 'Hunters Point Shipyard', "Hunter's Point"],
    context: ['remediation', 'cleanup', 'radiological', 'Navy', 'shipyard', 'contractor', 'RSI', 'soil', 'testing', 'contamination', 'San Francisco'],
    exclude: ['Queens', 'Long Island City', 'Hunters Point South', 'LIC'],
    confirm: [
      'Hunters Point, Queens (New York) is excluded. OK?',
      'Hunters Point has a long history of negative press about the Navy cleanup (e.g. the Tetra Tech testing scandal). Stories about the site in general will be included as relevant context — OK?',
    ],
  },
];
