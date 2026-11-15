-- The recycler gives a furni for many: its rewards, each habbo's recycling, and the furni that wait in it.
-- decision server/0093. The rewards are Holo's four.

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

ALTER TABLE furni ADD COLUMN recycler_avatar_id INTEGER REFERENCES avatars(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_furni_recycler_avatar_id ON furni (recycler_avatar_id);

INSERT OR IGNORE INTO recycler_rewards (furni_count, furni_definition_id) VALUES
    (20, 463),
    (30, 464),
    (40, 462),
    (50, 1279);
