-- The catalogue: what each furni is, the catalogue's pages and what they sell (decisions server/0091 and server/0097).

-- What a furni is. sprite names its class to the client, which reads a variant after a *. kind says where it stands:
-- on a wall, or on the floor as a solid, a seat, a bed, a rug or a roller, which carries what stands on it. length,
-- width, height and colours describe a floor furni, and data what a wall item carries, a poster's number. door marks
-- a furni that opens to let habbos through.
CREATE TABLE IF NOT EXISTS furni_definitions (
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

CREATE INDEX IF NOT EXISTS idx_furni_definitions_sprite ON furni_definitions (sprite);

-- A page of the catalogue, listed by position. code names it to the client, whose recycler reads the page Recycler.
-- A habbo needs min_level, the highest level of its access groups, to see it, and open_to_club shows it to club
-- members below that level. club_only pages sell only to club members.
CREATE TABLE IF NOT EXISTS catalogue_pages (
    id INTEGER PRIMARY KEY,
    position INTEGER NOT NULL,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    layout TEXT NOT NULL,
    header_image TEXT NOT NULL DEFAULT '',
    teaser_images TEXT NOT NULL DEFAULT '',
    header_text TEXT NOT NULL DEFAULT '',
    teaser_text TEXT NOT NULL DEFAULT '',
    special_text TEXT NOT NULL DEFAULT '',
    min_level INTEGER NOT NULL DEFAULT 0 CHECK (min_level >= 0),
    open_to_club BOOLEAN NOT NULL DEFAULT FALSE,
    club_only BOOLEAN NOT NULL DEFAULT FALSE
);

-- A numbered text of a page, which its layout places.
CREATE TABLE IF NOT EXISTS catalogue_page_texts (
    catalogue_page_id INTEGER NOT NULL REFERENCES catalogue_pages(id) ON DELETE CASCADE,
    number INTEGER NOT NULL CHECK (number > 0),
    text TEXT NOT NULL,
    PRIMARY KEY (catalogue_page_id, number)
);

-- What a page sells, for a price in credits. code names the item to the client, which sends it back to buy the item
-- and shows the picture ctlg_pic_<code> when its cast holds one, as it does for deal97.
CREATE TABLE IF NOT EXISTS catalogue_items (
    id INTEGER PRIMARY KEY,
    catalogue_page_id INTEGER NOT NULL REFERENCES catalogue_pages(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    price INTEGER NOT NULL CHECK (price >= 0)
);

CREATE INDEX IF NOT EXISTS idx_catalogue_items_catalogue_page_id ON catalogue_items (catalogue_page_id);

-- The furni a catalogue item gives: one piece of one furni, or a deal's several.
CREATE TABLE IF NOT EXISTS catalogue_item_furni (
    catalogue_item_id INTEGER NOT NULL REFERENCES catalogue_items(id) ON DELETE CASCADE,
    furni_definition_id INTEGER NOT NULL REFERENCES furni_definitions(id),
    amount INTEGER NOT NULL DEFAULT 1 CHECK (amount > 0),
    PRIMARY KEY (catalogue_item_id, furni_definition_id)
);

CREATE INDEX IF NOT EXISTS idx_catalogue_item_furni_furni_definition_id ON catalogue_item_furni (furni_definition_id);
