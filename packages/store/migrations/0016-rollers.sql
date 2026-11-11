-- Rollers are a kind of furni of their own, which habbos walk onto and which carries what stands on it.
-- plans/server decision 0107. The ten rollers of Holo's catalogue, 465 to 474, were solids there, and take the kind.

CREATE TABLE furni_definitions_new (
    id INTEGER PRIMARY KEY,
    sprite TEXT NOT NULL,
    kind TEXT NOT NULL CHECK (kind IN ('wall', 'solid', 'seat', 'bed', 'rug', 'roller')),
    length INTEGER NOT NULL DEFAULT 0 CHECK (length >= 0),
    width INTEGER NOT NULL DEFAULT 0 CHECK (width >= 0),
    height REAL NOT NULL DEFAULT 0 CHECK (height >= 0),
    colours TEXT NOT NULL DEFAULT '',
    data TEXT NOT NULL DEFAULT '',
    door BOOLEAN NOT NULL DEFAULT FALSE,
    tradeable BOOLEAN NOT NULL DEFAULT TRUE,
    recyclable BOOLEAN NOT NULL DEFAULT TRUE
);

INSERT INTO furni_definitions_new (id, sprite, kind, length, width, height, colours, data, door, tradeable, recyclable)
SELECT id, sprite, kind, length, width, height, colours, data, door, tradeable, recyclable FROM furni_definitions;

DROP TABLE furni_definitions;

ALTER TABLE furni_definitions_new RENAME TO furni_definitions;

CREATE INDEX IF NOT EXISTS idx_furni_definitions_sprite ON furni_definitions (sprite);

UPDATE furni_definitions SET kind = 'roller' WHERE id BETWEEN 465 AND 474 AND kind = 'solid';
