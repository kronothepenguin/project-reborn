-- A home belongs to exactly one profile or one group.
CREATE TABLE IF NOT EXISTS homes (
    id INTEGER PRIMARY KEY,
    profile_id INTEGER REFERENCES profiles(id) ON DELETE CASCADE,
    group_id INTEGER REFERENCES groups(id) ON DELETE CASCADE,
    background_home_store_item_id INTEGER REFERENCES home_store_items(id),
    updated_at DATETIME NOT NULL,
    CHECK ((profile_id IS NULL) <> (group_id IS NULL))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_homes_profile_id ON homes(profile_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_homes_group_id ON homes(group_id);

CREATE TABLE IF NOT EXISTS home_items (
    id INTEGER PRIMARY KEY,
    home_id INTEGER NOT NULL REFERENCES homes(id) ON DELETE CASCADE,
    kind TEXT NOT NULL,
    home_store_item_id INTEGER REFERENCES home_store_items(id),
    widget TEXT,
    skin TEXT NOT NULL DEFAULT '',
    body TEXT NOT NULL DEFAULT '',
    x INTEGER NOT NULL,
    y INTEGER NOT NULL,
    z INTEGER NOT NULL,
    created_by_avatar_id INTEGER REFERENCES avatars(id) ON DELETE SET NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_home_items_home_id ON home_items(home_id);
