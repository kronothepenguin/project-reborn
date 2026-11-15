-- Plural names for the furni, the home inventory and the furni of catalogue items, with their rows kept.
-- Table names are plural, always. Each table is made again under its new name and its rows copied; furni_notes is
-- made again too, so that its foreign key names furnis.

CREATE TABLE furnis (
    id INTEGER PRIMARY KEY,
    furni_definition_id INTEGER NOT NULL REFERENCES furni_definitions(id),
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    avatar_id INTEGER REFERENCES avatars(id) ON DELETE SET NULL,
    room_id INTEGER REFERENCES rooms(id) ON DELETE SET NULL,
    x INTEGER NOT NULL DEFAULT 0,
    y INTEGER NOT NULL DEFAULT 0,
    altitude REAL NOT NULL DEFAULT 0,
    direction INTEGER NOT NULL DEFAULT 0 CHECK (direction BETWEEN 0 AND 7),
    wall_position TEXT NOT NULL DEFAULT '',
    state TEXT NOT NULL DEFAULT '',
    created_at DATETIME NOT NULL,
    box_furni_id INTEGER REFERENCES furnis(id) ON DELETE SET NULL,
    partner_furni_id INTEGER REFERENCES furnis(id) ON DELETE SET NULL,
    recycler_avatar_id INTEGER REFERENCES avatars(id) ON DELETE SET NULL,
    CHECK (avatar_id IS NULL OR room_id IS NULL)
);

INSERT INTO furnis (id, furni_definition_id, user_id, avatar_id, room_id, x, y, altitude, direction, wall_position, state,
    created_at, box_furni_id, partner_furni_id, recycler_avatar_id)
SELECT id, furni_definition_id, user_id, avatar_id, room_id, x, y, altitude, direction, wall_position, state,
    created_at, box_furni_id, partner_furni_id, recycler_avatar_id
FROM furni;

CREATE TABLE furni_notes_new (
    furni_id INTEGER PRIMARY KEY REFERENCES furnis(id) ON DELETE CASCADE,
    text TEXT NOT NULL
);

INSERT INTO furni_notes_new (furni_id, text)
SELECT furni_id, text
FROM furni_notes;

DROP TABLE furni_notes;

ALTER TABLE furni_notes_new RENAME TO furni_notes;

DROP TABLE furni;

CREATE INDEX IF NOT EXISTS idx_furnis_user_id ON furnis (user_id);
CREATE INDEX IF NOT EXISTS idx_furnis_avatar_id ON furnis (avatar_id);
CREATE INDEX IF NOT EXISTS idx_furnis_room_id ON furnis (room_id);
CREATE INDEX IF NOT EXISTS idx_furnis_box_furni_id ON furnis (box_furni_id);
CREATE INDEX IF NOT EXISTS idx_furnis_partner_furni_id ON furnis (partner_furni_id);
CREATE INDEX IF NOT EXISTS idx_furnis_recycler_avatar_id ON furnis (recycler_avatar_id);

CREATE TABLE home_inventories (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    home_store_item_id INTEGER NOT NULL REFERENCES home_store_items(id),
    quantity INTEGER NOT NULL CHECK (quantity >= 0),
    PRIMARY KEY (user_id, home_store_item_id)
);

INSERT INTO home_inventories (user_id, home_store_item_id, quantity)
SELECT user_id, home_store_item_id, quantity
FROM home_inventory;

DROP TABLE home_inventory;

CREATE TABLE catalogue_item_furnis (
    catalogue_item_id INTEGER NOT NULL REFERENCES catalogue_items(id) ON DELETE CASCADE,
    furni_definition_id INTEGER NOT NULL REFERENCES furni_definitions(id),
    amount INTEGER NOT NULL DEFAULT 1 CHECK (amount > 0),
    PRIMARY KEY (catalogue_item_id, furni_definition_id)
);

INSERT INTO catalogue_item_furnis (catalogue_item_id, furni_definition_id, amount)
SELECT catalogue_item_id, furni_definition_id, amount
FROM catalogue_item_furni;

DROP TABLE catalogue_item_furni;

CREATE INDEX IF NOT EXISTS idx_catalogue_item_furnis_furni_definition_id ON catalogue_item_furnis (furni_definition_id);
