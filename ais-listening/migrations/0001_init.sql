-- AIS Social Listening schema

CREATE TABLE topics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  opco TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('opco', 'project', 'location')),
  keywords TEXT NOT NULL DEFAULT '[]',   -- JSON array
  context TEXT NOT NULL DEFAULT '[]',    -- JSON array
  exclude TEXT NOT NULL DEFAULT '[]',    -- JSON array
  confirm TEXT NOT NULL DEFAULT '[]',    -- JSON array of open questions
  paused INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE scans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  trigger TEXT NOT NULL,                 -- 'scheduled' | 'manual'
  started_at TEXT NOT NULL,
  finished_at TEXT,
  topics_total INTEGER NOT NULL DEFAULT 0,
  topics_done INTEGER NOT NULL DEFAULT 0,
  new_items INTEGER NOT NULL DEFAULT 0
);

-- One row per topic per scan: what each source returned, what was filtered.
CREATE TABLE scan_runs (
  scan_id INTEGER NOT NULL,
  topic_id INTEGER NOT NULL,
  finished_at TEXT NOT NULL,
  fetched INTEGER NOT NULL DEFAULT 0,
  excluded INTEGER NOT NULL DEFAULT 0,
  no_context INTEGER NOT NULL DEFAULT 0,
  duplicates INTEGER NOT NULL DEFAULT 0,
  new_items INTEGER NOT NULL DEFAULT 0,
  scorer TEXT,                           -- 'claude' | 'rules'
  sources TEXT NOT NULL DEFAULT '{}',    -- JSON {source: count | "error: ..."}
  PRIMARY KEY (scan_id, topic_id)
);

CREATE TABLE items (
  id TEXT PRIMARY KEY,                   -- hash(topic_id + canonical url)
  topic_id INTEGER NOT NULL,
  opco TEXT NOT NULL,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  title_key TEXT NOT NULL,               -- normalized title for dedupe
  source TEXT,
  domain TEXT,
  platform TEXT NOT NULL,                -- 'Google News' | 'Bing News' | 'GDELT' | 'Reddit' | 'Bluesky' | 'Web' ...
  source_type TEXT NOT NULL,             -- 'news' | 'social' | 'web'
  published_at TEXT,
  snippet TEXT,
  sentiment TEXT NOT NULL,               -- 'positive' | 'neutral' | 'negative'
  relevance INTEGER NOT NULL,
  why TEXT,
  matched TEXT NOT NULL DEFAULT '{}',    -- JSON {keywords:[], context:[]}
  scorer TEXT NOT NULL,
  cluster_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',   -- 'open' | 'reviewed' | 'dismissed'
  starred INTEGER NOT NULL DEFAULT 0,
  scan_id INTEGER,
  first_seen_at TEXT NOT NULL,
  updated_at TEXT
);
CREATE INDEX items_seen ON items (first_seen_at);
CREATE INDEX items_topic ON items (topic_id, first_seen_at);
CREATE INDEX items_cluster ON items (cluster_id);

-- "Not relevant" feedback; used to teach the relevance check.
CREATE TABLE feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  topic_id INTEGER NOT NULL,
  item_id TEXT NOT NULL,
  title TEXT NOT NULL,
  domain TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX feedback_topic ON feedback (topic_id, created_at);

CREATE TABLE login_attempts (
  ip TEXT NOT NULL,
  at INTEGER NOT NULL
);
CREATE INDEX login_attempts_ip ON login_attempts (ip, at);
