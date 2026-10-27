CREATE TABLE IF NOT EXISTS home_store_categories (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    staff_only BOOLEAN NOT NULL DEFAULT FALSE,
    position INTEGER NOT NULL DEFAULT 0
);

-- Items in use by homes or inventories cannot be deleted: disable them instead.
CREATE TABLE IF NOT EXISTS home_store_items (
    id INTEGER PRIMARY KEY,
    home_store_category_id INTEGER NOT NULL REFERENCES home_store_categories(id),
    kind TEXT NOT NULL,
    asset TEXT NOT NULL,
    name TEXT NOT NULL,
    price INTEGER NOT NULL CHECK (price >= 0),
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 1),
    enabled BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_home_store_items_home_store_category_id ON home_store_items(home_store_category_id);

CREATE TABLE IF NOT EXISTS home_inventory (
    avatar_id INTEGER NOT NULL REFERENCES avatars(id) ON DELETE CASCADE,
    home_store_item_id INTEGER NOT NULL REFERENCES home_store_items(id),
    quantity INTEGER NOT NULL CHECK (quantity >= 0),
    PRIMARY KEY (avatar_id, home_store_item_id)
);
