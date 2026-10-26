-- Where in the piece we're named, and the sentence that names us.
ALTER TABLE items ADD COLUMN mention_where TEXT;   -- 'Headline' | 'Lead paragraph' | 'Paragraph 4' | 'Post text' | 'Photo'
ALTER TABLE items ADD COLUMN mention_quote TEXT;
