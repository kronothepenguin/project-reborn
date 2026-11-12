-- The recycler, which gives a furni for many (plans/server decision 0093).

-- What the recycler gives: the furni a habbo gets for recycling furni_count pieces at once.
CREATE TABLE IF NOT EXISTS recycler_rewards (
    furni_count INTEGER PRIMARY KEY CHECK (furni_count > 0),
    furni_definition_id INTEGER NOT NULL REFERENCES furni_definitions(id)
);

-- A habbo's recycling, one at a time: when it started and the furni it brings. The pieces the habbo gave wait in
-- furni, under recycler_avatar_id.
CREATE TABLE IF NOT EXISTS recyclings (
    avatar_id INTEGER PRIMARY KEY REFERENCES avatars(id) ON DELETE CASCADE,
    furni_definition_id INTEGER NOT NULL REFERENCES furni_definitions(id),
    started_at DATETIME NOT NULL
);
