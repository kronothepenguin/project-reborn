-- The navigator: its categories, the room models, the public rooms, the habbos' rooms and their favourite rooms
-- (plans/server decisions 0055 and 0063).

-- A category of the navigator, which holds either public rooms or habbo rooms. A habbo needs min_level, the highest
-- level of its access groups, to put a room in it, and a category with hidden_below_level is shown only from that
-- level on.
CREATE TABLE IF NOT EXISTS room_categories (
    id INTEGER PRIMARY KEY,
    parent_id INTEGER REFERENCES room_categories(id),
    kind TEXT NOT NULL CHECK (kind IN ('public', 'rooms')),
    name TEXT NOT NULL,
    min_level INTEGER NOT NULL DEFAULT 0 CHECK (min_level >= 0),
    hidden_below_level BOOLEAN NOT NULL DEFAULT FALSE,
    trading BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_room_categories_parent_id ON room_categories (parent_id);

-- A room's floor plan: its door, its heightmap, one line of text per row, and the public furni of a public room, one
-- line per item. habbo_rooms marks the models a habbo may build a room on, and club_only those that need the club.
CREATE TABLE IF NOT EXISTS room_models (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    habbo_rooms BOOLEAN NOT NULL DEFAULT FALSE,
    club_only BOOLEAN NOT NULL DEFAULT FALSE,
    door_x INTEGER NOT NULL,
    door_y INTEGER NOT NULL,
    door_height INTEGER NOT NULL,
    door_direction INTEGER NOT NULL CHECK (door_direction BETWEEN 0 AND 7),
    heightmap TEXT NOT NULL,
    public_items TEXT NOT NULL DEFAULT '',
    swimming_pool BOOLEAN NOT NULL DEFAULT FALSE,
    special_cast TEXT,
    special_cast_interval_ms INTEGER,
    special_cast_min INTEGER,
    special_cast_max INTEGER
);

-- A public room: unit names it to the client, which loads its casts.
CREATE TABLE IF NOT EXISTS public_rooms (
    id INTEGER PRIMARY KEY,
    room_category_id INTEGER NOT NULL REFERENCES room_categories(id),
    room_model_id INTEGER NOT NULL REFERENCES room_models(id),
    name TEXT NOT NULL,
    unit TEXT NOT NULL,
    casts TEXT NOT NULL,
    max_visitors INTEGER NOT NULL CHECK (max_visitors > 0)
);

CREATE INDEX IF NOT EXISTS idx_public_rooms_room_category_id ON public_rooms (room_category_id);

-- A habbo's room. The creator never changes, the owner may become another habbo of the same user, and the password is
-- a hash.
CREATE TABLE IF NOT EXISTS rooms (
    id INTEGER PRIMARY KEY,
    creator_avatar_id INTEGER NOT NULL REFERENCES avatars(id) ON DELETE CASCADE,
    owner_avatar_id INTEGER NOT NULL REFERENCES avatars(id) ON DELETE CASCADE,
    room_category_id INTEGER NOT NULL REFERENCES room_categories(id),
    room_model_id INTEGER NOT NULL REFERENCES room_models(id),
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    door TEXT NOT NULL DEFAULT 'open' CHECK (door IN ('open', 'closed', 'password')),
    password_hash TEXT,
    show_owner BOOLEAN NOT NULL DEFAULT TRUE,
    others_move_furni BOOLEAN NOT NULL DEFAULT FALSE,
    max_visitors INTEGER NOT NULL DEFAULT 25 CHECK (max_visitors > 0),
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rooms_owner_avatar_id ON rooms (owner_avatar_id);
CREATE INDEX IF NOT EXISTS idx_rooms_room_category_id ON rooms (room_category_id);

-- A habbo's favourite room: a public room or a habbo room, never both.
CREATE TABLE IF NOT EXISTS favourite_rooms (
    avatar_id INTEGER NOT NULL REFERENCES avatars(id) ON DELETE CASCADE,
    public_room_id INTEGER REFERENCES public_rooms(id) ON DELETE CASCADE,
    room_id INTEGER REFERENCES rooms(id) ON DELETE CASCADE,
    created_at DATETIME NOT NULL,
    CHECK ((public_room_id IS NULL) <> (room_id IS NULL))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_favourite_rooms_avatar_id_public_room_id ON favourite_rooms (avatar_id, public_room_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_favourite_rooms_avatar_id_room_id ON favourite_rooms (avatar_id, room_id);
