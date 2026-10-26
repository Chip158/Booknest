-- "Are we named or pictured?" — the main thing the team watches for.
ALTER TABLE items ADD COLUMN exposure TEXT NOT NULL DEFAULT 'pending'; -- 'named' | 'pictured' | 'not_named' | 'pending'
ALTER TABLE items ADD COLUMN names_found TEXT NOT NULL DEFAULT '[]';   -- JSON: our company names found in the text
ALTER TABLE items ADD COLUMN photo TEXT NOT NULL DEFAULT 'unchecked';  -- 'yes' | 'no' | 'unclear' | 'none' | 'unchecked'
ALTER TABLE items ADD COLUMN photo_note TEXT;
ALTER TABLE items ADD COLUMN images TEXT NOT NULL DEFAULT '[]';        -- JSON: photo URLs found
ALTER TABLE items ADD COLUMN article_url TEXT;                         -- publisher URL (Google News links resolved)
ALTER TABLE items ADD COLUMN text_checked INTEGER NOT NULL DEFAULT 0;  -- 1 = full article text was read
CREATE INDEX items_exposure ON items (exposure, first_seen_at);
