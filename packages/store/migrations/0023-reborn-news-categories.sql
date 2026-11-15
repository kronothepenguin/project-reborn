-- News in HoloCMS and Holograph Emulator moves to Reborn CMS and Reborn Server.
-- The news form offers the two categories under Reborn's names; articles saved under the old names follow them.

UPDATE news_articles SET category = 'Reborn CMS' WHERE category = 'HoloCMS';
UPDATE news_articles SET category = 'Reborn Server' WHERE category = 'Holograph Emulator';
