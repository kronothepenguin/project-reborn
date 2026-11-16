-- Club news in Holo Club moves to Reborn Club in a hotel that kept the default short name.
-- The club's category is named after site.shortName, whose default is now Reborn; a hotel that kept the default holds
-- no site.shortName row. A hotel with a short name of its own keeps its articles where they are.

UPDATE news_articles SET category = 'Reborn Club'
WHERE category = 'Holo Club' AND NOT EXISTS (SELECT 1 FROM settings WHERE key = 'site.shortName');
