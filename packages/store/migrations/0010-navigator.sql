-- The navigator's categories, room models, public rooms, habbo rooms and favourite rooms, with Holo's categories,
-- public rooms and room models.
-- The categories come from source/holoemu/Resources/holodb.sql, whose names are English, and the public rooms and
-- the models from source/holoemu/holodb.sql (plans/server decision 0055). BattleBall and SnowStorm wait for S8.
-- "No category" takes the id 2 for Holo's 0, since the client ends a list of nodes at an id of 0, and sits under
-- Guestrooms. A Holo rank of 1 is level 0, everyone. Heightmaps and public furni keep one row or item per line,
-- without Holo's carriage returns and the stray character 1 at the end of sunset_cafe's heightmap.

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

INSERT OR IGNORE INTO room_categories (id, parent_id, kind, name, min_level, hidden_below_level, trading) VALUES
    (2, 4, 'rooms', 'No category', 0, FALSE, FALSE),
    (3, NULL, 'public', 'Public Rooms', 0, FALSE, FALSE),
    (4, NULL, 'rooms', 'Guestrooms', 0, FALSE, FALSE),
    (5, 3, 'public', 'Outside spaces', 0, FALSE, FALSE),
    (6, 4, 'rooms', 'Trade rooms', 0, FALSE, TRUE),
    (7, 3, 'public', 'Entertainment', 0, FALSE, FALSE),
    (8, 5, 'public', 'The Park & Infobus', 0, FALSE, FALSE),
    (9, 7, 'public', 'Clubs & bars', 0, FALSE, FALSE),
    (10, 4, 'rooms', 'Staff''s Rooms', 7, FALSE, TRUE),
    (24, 4, 'rooms', 'Moderators Rooms', 6, FALSE, TRUE),
    (25, 4, 'rooms', 'Games and Fun', 0, FALSE, TRUE),
    (26, 4, 'rooms', 'HelpDesk', 0, FALSE, FALSE),
    (27, 4, 'rooms', 'Donation', 0, FALSE, TRUE),
    (28, 4, 'rooms', 'Chil Rooms', 0, FALSE, FALSE),
    (29, 4, 'rooms', 'Theme Rooms', 0, FALSE, FALSE);

INSERT OR IGNORE INTO room_models (id, name, habbo_rooms, club_only, door_x, door_y, door_height, door_direction, heightmap, public_items, swimming_pool, special_cast, special_cast_interval_ms, special_cast_min, special_cast_max) VALUES (
    1, 'a', TRUE, FALSE, 3, 5, 0, 0,
    'xxxxxxxxxxxx
xxxx00000000
xxxx00000000
xxxx00000000
xxxx00000000
xxxx00000000
xxxx00000000
xxxx00000000
xxxx00000000
xxxx00000000
xxxx00000000
xxxx00000000
xxxx00000000
xxxx00000000
xxxxxxxxxxxx
xxxxxxxxxxxx',
    '',
    FALSE, NULL, NULL, NULL, NULL
);

INSERT OR IGNORE INTO room_models (id, name, habbo_rooms, club_only, door_x, door_y, door_height, door_direction, heightmap, public_items, swimming_pool, special_cast, special_cast_interval_ms, special_cast_min, special_cast_max) VALUES (
    2, 'b', TRUE, FALSE, 0, 5, 0, 0,
    'xxxxxxxxxxxx
xxxxx0000000
xxxxx0000000
xxxxx0000000
xxxxx0000000
x00000000000
x00000000000
x00000000000
x00000000000
x00000000000
x00000000000
xxxxxxxxxxxx
xxxxxxxxxxxx
xxxxxxxxxxxx
xxxxxxxxxxxx
xxxxxxxxxxxx',
    '',
    FALSE, NULL, NULL, NULL, NULL
);

INSERT OR IGNORE INTO room_models (id, name, habbo_rooms, club_only, door_x, door_y, door_height, door_direction, heightmap, public_items, swimming_pool, special_cast, special_cast_interval_ms, special_cast_min, special_cast_max) VALUES (
    3, 'c', TRUE, FALSE, 4, 7, 0, 0,
    'xxxxxxxxxxxx
xxxxxxxxxxxx
xxxxxxxxxxxx
xxxxxxxxxxxx
xxxxxxxxxxxx
xxxxx000000x
xxxxx000000x
xxxxx000000x
xxxxx000000x
xxxxx000000x
xxxxx000000x
xxxxxxxxxxxx
xxxxxxxxxxxx
xxxxxxxxxxxx
xxxxxxxxxxxx
xxxxxxxxxxxx',
    '',
    FALSE, NULL, NULL, NULL, NULL
);

INSERT OR IGNORE INTO room_models (id, name, habbo_rooms, club_only, door_x, door_y, door_height, door_direction, heightmap, public_items, swimming_pool, special_cast, special_cast_interval_ms, special_cast_min, special_cast_max) VALUES (
    4, 'd', TRUE, FALSE, 4, 7, 0, 0,
    'xxxxxxxxxxxx
xxxxx000000x
xxxxx000000x
xxxxx000000x
xxxxx000000x
xxxxx000000x
xxxxx000000x
xxxxx000000x
xxxxx000000x
xxxxx000000x
xxxxx000000x
xxxxx000000x
xxxxx000000x
xxxxx000000x
xxxxx000000x
xxxxxxxxxxxx',
    '',
    FALSE, NULL, NULL, NULL, NULL
);

INSERT OR IGNORE INTO room_models (id, name, habbo_rooms, club_only, door_x, door_y, door_height, door_direction, heightmap, public_items, swimming_pool, special_cast, special_cast_interval_ms, special_cast_min, special_cast_max) VALUES (
    5, 'e', TRUE, FALSE, 1, 5, 0, 0,
    'xxxxxxxxxxxx
xxxxxxxxxxxx
xxxxxxxxxxxx
xx0000000000
xx0000000000
xx0000000000
xx0000000000
xx0000000000
xx0000000000
xx0000000000
xx0000000000
xxxxxxxxxxxx
xxxxxxxxxxxx
xxxxxxxxxxxx
xxxxxxxxxxxx
xxxxxxxxxxxx',
    '',
    FALSE, NULL, NULL, NULL, NULL
);

INSERT OR IGNORE INTO room_models (id, name, habbo_rooms, club_only, door_x, door_y, door_height, door_direction, heightmap, public_items, swimming_pool, special_cast, special_cast_interval_ms, special_cast_min, special_cast_max) VALUES (
    6, 'f', TRUE, FALSE, 2, 5, 0, 0,
    'xxxxxxxxxxxx
xxxxxxx0000x
xxxxxxx0000x
xxx00000000x
xxx00000000x
xxx00000000x
xxx00000000x
x0000000000x
x0000000000x
x0000000000x
x0000000000x
xxxxxxxxxxxx
xxxxxxxxxxxx
xxxxxxxxxxxx
xxxxxxxxxxxx
xxxxxxxxxxxx',
    '',
    FALSE, NULL, NULL, NULL, NULL
);

INSERT OR IGNORE INTO room_models (id, name, habbo_rooms, club_only, door_x, door_y, door_height, door_direction, heightmap, public_items, swimming_pool, special_cast, special_cast_interval_ms, special_cast_min, special_cast_max) VALUES (
    7, 'g', TRUE, TRUE, 1, 7, 1, 0,
    'xxxxxxxxxxxxx
xxxxxxxxxxxxx
xxxxxxx00000x
xxxxxxx00000x
xxxxxxx00000x
xx1111000000x
xx1111000000x
xx1111000000x
xx1111000000x
xx1111000000x
xxxxxxx00000x
xxxxxxx00000x
xxxxxxx00000x
xxxxxxxxxxxxx
xxxxxxxxxxxxx
xxxxxxxxxxxxx
xxxxxxxxxxxxx',
    '',
    FALSE, NULL, NULL, NULL, NULL
);

INSERT OR IGNORE INTO room_models (id, name, habbo_rooms, club_only, door_x, door_y, door_height, door_direction, heightmap, public_items, swimming_pool, special_cast, special_cast_interval_ms, special_cast_min, special_cast_max) VALUES (
    8, 'h', TRUE, TRUE, 4, 4, 1, 0,
    'xxxxxxxxxxxx
xxxxxxxxxxxx
xxxxx111111x
xxxxx111111x
xxxxx111111x
xxxxx111111x
xxxxx111111x
xxxxx000000x
xxxxx000000x
xxx00000000x
xxx00000000x
xxx00000000x
xxx00000000x
xxxxxxxxxxxx
xxxxxxxxxxxx
xxxxxxxxxxxx',
    '',
    FALSE, NULL, NULL, NULL, NULL
);

INSERT OR IGNORE INTO room_models (id, name, habbo_rooms, club_only, door_x, door_y, door_height, door_direction, heightmap, public_items, swimming_pool, special_cast, special_cast_interval_ms, special_cast_min, special_cast_max) VALUES (
    9, 'i', TRUE, FALSE, 0, 10, 0, 0,
    'xxxxxxxxxxxxxxxxx
x0000000000000000
x0000000000000000
x0000000000000000
x0000000000000000
x0000000000000000
x0000000000000000
x0000000000000000
x0000000000000000
x0000000000000000
x0000000000000000
x0000000000000000
x0000000000000000
x0000000000000000
x0000000000000000
x0000000000000000
x0000000000000000
x0000000000000000
x0000000000000000
x0000000000000000
x0000000000000000
x0000000000000000
x0000000000000000
x0000000000000000
x0000000000000000
x0000000000000000
x0000000000000000
xxxxxxxxxxxxxxxxx',
    '',
    FALSE, NULL, NULL, NULL, NULL
);

INSERT OR IGNORE INTO room_models (id, name, habbo_rooms, club_only, door_x, door_y, door_height, door_direction, heightmap, public_items, swimming_pool, special_cast, special_cast_interval_ms, special_cast_min, special_cast_max) VALUES (
    10, 'j', TRUE, FALSE, 0, 10, 0, 0,
    'xxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxx0000000000
xxxxxxxxxxx0000000000
xxxxxxxxxxx0000000000
xxxxxxxxxxx0000000000
xxxxxxxxxxx0000000000
xxxxxxxxxxx0000000000
x00000000000000000000
x00000000000000000000
x00000000000000000000
x00000000000000000000
x00000000000000000000
x00000000000000000000
x00000000000000000000
x00000000000000000000
x00000000000000000000
x00000000000000000000
x0000000000xxxxxxxxxx
x0000000000xxxxxxxxxx
x0000000000xxxxxxxxxx
x0000000000xxxxxxxxxx
x0000000000xxxxxxxxxx
x0000000000xxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxx',
    '',
    FALSE, NULL, NULL, NULL, NULL
);

INSERT OR IGNORE INTO room_models (id, name, habbo_rooms, club_only, door_x, door_y, door_height, door_direction, heightmap, public_items, swimming_pool, special_cast, special_cast_interval_ms, special_cast_min, special_cast_max) VALUES (
    11, 'k', TRUE, FALSE, 0, 13, 0, 0,
    'xxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxx00000000
xxxxxxxxxxxxxxxxx00000000
xxxxxxxxxxxxxxxxx00000000
xxxxxxxxxxxxxxxxx00000000
xxxxxxxxx0000000000000000
xxxxxxxxx0000000000000000
xxxxxxxxx0000000000000000
xxxxxxxxx0000000000000000
x000000000000000000000000
x000000000000000000000000
x000000000000000000000000
x000000000000000000000000
x000000000000000000000000
x000000000000000000000000
x000000000000000000000000
x000000000000000000000000
xxxxxxxxx0000000000000000
xxxxxxxxx0000000000000000
xxxxxxxxx0000000000000000
xxxxxxxxx0000000000000000
xxxxxxxxx0000000000000000
xxxxxxxxx0000000000000000
xxxxxxxxx0000000000000000
xxxxxxxxx0000000000000000
xxxxxxxxx0000000000000000
xxxxxxxxx0000000000000000
xxxxxxxxxxxxxxxxxxxxxxxxx',
    '',
    FALSE, NULL, NULL, NULL, NULL
);

INSERT OR IGNORE INTO room_models (id, name, habbo_rooms, club_only, door_x, door_y, door_height, door_direction, heightmap, public_items, swimming_pool, special_cast, special_cast_interval_ms, special_cast_min, special_cast_max) VALUES (
    12, 'l', TRUE, FALSE, 0, 16, 0, 0,
    'xxxxxxxxxxxxxxxxxxxxx
x00000000000000000000
x00000000000000000000
x00000000000000000000
x00000000000000000000
x00000000000000000000
x00000000000000000000
x00000000000000000000
x00000000000000000000
x00000000xxxx00000000
x00000000xxxx00000000
x00000000xxxx00000000
x00000000xxxx00000000
x00000000xxxx00000000
x00000000xxxx00000000
x00000000xxxx00000000
x00000000xxxx00000000
x00000000xxxx00000000
x00000000xxxx00000000
x00000000xxxx00000000
x00000000xxxx00000000
xxxxxxxxxxxxxxxxxxxxx',
    '',
    FALSE, NULL, NULL, NULL, NULL
);

INSERT OR IGNORE INTO room_models (id, name, habbo_rooms, club_only, door_x, door_y, door_height, door_direction, heightmap, public_items, swimming_pool, special_cast, special_cast_interval_ms, special_cast_min, special_cast_max) VALUES (
    13, 'm', TRUE, FALSE, 0, 15, 1, 0,
    'xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxx00000000xxxxxxxxxx
xxxxxxxxxxx00000000xxxxxxxxxx
xxxxxxxxxxx00000000xxxxxxxxxx
xxxxxxxxxxx00000000xxxxxxxxxx
xxxxxxxxxxx00000000xxxxxxxxxx
xxxxxxxxxxx00000000xxxxxxxxxx
xxxxxxxxxxx00000000xxxxxxxxxx
xxxxxxxxxxx00000000xxxxxxxxxx
xxxxxxxxxxx00000000xxxxxxxxxx
xxxxxxxxxxx00000000xxxxxxxxxx
x0000000000000000000000000000
x0000000000000000000000000000
x0000000000000000000000000000
x0000000000000000000000000000
x0000000000000000000000000000
x0000000000000000000000000000
x0000000000000000000000000000
x0000000000000000000000000000
xxxxxxxxxxx00000000xxxxxxxxxx
xxxxxxxxxxx00000000xxxxxxxxxx
xxxxxxxxxxx00000000xxxxxxxxxx
xxxxxxxxxxx00000000xxxxxxxxxx
xxxxxxxxxxx00000000xxxxxxxxxx
xxxxxxxxxxx00000000xxxxxxxxxx
xxxxxxxxxxx00000000xxxxxxxxxx
xxxxxxxxxxx00000000xxxxxxxxxx
xxxxxxxxxxx00000000xxxxxxxxxx
xxxxxxxxxxx00000000xxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    '',
    FALSE, NULL, NULL, NULL, NULL
);

INSERT OR IGNORE INTO room_models (id, name, habbo_rooms, club_only, door_x, door_y, door_height, door_direction, heightmap, public_items, swimming_pool, special_cast, special_cast_interval_ms, special_cast_min, special_cast_max) VALUES (
    14, 'n', TRUE, FALSE, 0, 16, 0, 0,
    'xxxxxxxxxxxxxxxxxxxxx
x00000000000000000000
x00000000000000000000
x00000000000000000000
x00000000000000000000
x00000000000000000000
x00000000000000000000
x000000xxxxxxxx000000
x000000x000000x000000
x000000x000000x000000
x000000x000000x000000
x000000x000000x000000
x000000x000000x000000
x000000x000000x000000
x000000xxxxxxxx000000
x00000000000000000000
x00000000000000000000
x00000000000000000000
x00000000000000000000
x00000000000000000000
x00000000000000000000
xxxxxxxxxxxxxxxxxxxxx',
    '',
    FALSE, NULL, NULL, NULL, NULL
);

INSERT OR IGNORE INTO room_models (id, name, habbo_rooms, club_only, door_x, door_y, door_height, door_direction, heightmap, public_items, swimming_pool, special_cast, special_cast_interval_ms, special_cast_min, special_cast_max) VALUES (
    15, 'o', TRUE, TRUE, 0, 18, 1, 0,
    'xxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxx11111111xxxx
xxxxxxxxxxxxx11111111xxxx
xxxxxxxxxxxxx11111111xxxx
xxxxxxxxxxxxx11111111xxxx
xxxxxxxxxxxxx11111111xxxx
xxxxxxxxxxxxx11111111xxxx
xxxxxxxxxxxxx11111111xxxx
xxxxxxxxxxxxx00000000xxxx
xxxxxxxxx0000000000000000
xxxxxxxxx0000000000000000
xxxxxxxxx0000000000000000
xxxxxxxxx0000000000000000
xxxxxxxxx0000000000000000
xxxxxxxxx0000000000000000
x111111100000000000000000
x111111100000000000000000
x111111100000000000000000
x111111100000000000000000
x111111100000000000000000
x111111100000000000000000
x111111100000000000000000
x111111100000000000000000
xxxxxxxxx0000000000000000
xxxxxxxxx0000000000000000
xxxxxxxxx0000000000000000
xxxxxxxxx0000000000000000
xxxxxxxxxxxxxxxxxxxxxxxxx',
    '',
    FALSE, NULL, NULL, NULL, NULL
);

INSERT OR IGNORE INTO room_models (id, name, habbo_rooms, club_only, door_x, door_y, door_height, door_direction, heightmap, public_items, swimming_pool, special_cast, special_cast_interval_ms, special_cast_min, special_cast_max) VALUES (
    16, 'p', TRUE, TRUE, 0, 23, 2, 0,
    'xxxxxxxxxxxxxxxxxxx
xxxxxxx222222222222
xxxxxxx222222222222
xxxxxxx222222222222
xxxxxxx222222222222
xxxxxxx222222222222
xxxxxxx222222222222
xxxxxxx22222222xxxx
xxxxxxx11111111xxxx
x222221111111111111
x222221111111111111
x222221111111111111
x222221111111111111
x222221111111111111
x222221111111111111
x222221111111111111
x222221111111111111
x2222xx11111111xxxx
x2222xx00000000xxxx
x2222xx000000000000
x2222xx000000000000
x2222xx000000000000
x2222xx000000000000
x2222xx000000000000
x2222xx000000000000
xxxxxxxxxxxxxxxxxxx',
    '',
    FALSE, NULL, NULL, NULL, NULL
);

INSERT OR IGNORE INTO room_models (id, name, habbo_rooms, club_only, door_x, door_y, door_height, door_direction, heightmap, public_items, swimming_pool, special_cast, special_cast_interval_ms, special_cast_min, special_cast_max) VALUES (
    17, 'q', TRUE, TRUE, 10, 4, 2, 0,
    'xxxxxxxxxxxxxxxxxxx
xxxxxxxxxxx22222222
xxxxxxxxxxx22222222
xxxxxxxxxxx22222222
xxxxxxxxxxx22222222
xxxxxxxxxxx22222222
xxxxxxxxxxx22222222
x222222222222222222
x222222222222222222
x222222222222222222
x222222222222222222
x222222222222222222
x222222222222222222
x2222xxxxxxxxxxxxxx
x2222xxxxxxxxxxxxxx
x2222211111xx000000
x222221111110000000
x222221111110000000
x2222211111xx000000
xx22xxx1111xxxxxxxx
xx11xxx1111xxxxxxxx
x1111xx1111xx000000
x1111xx111110000000
x1111xx111110000000
x1111xx1111xx000000
xxxxxxxxxxxxxxxxxxx',
    '',
    FALSE, NULL, NULL, NULL, NULL
);

INSERT OR IGNORE INTO room_models (id, name, habbo_rooms, club_only, door_x, door_y, door_height, door_direction, heightmap, public_items, swimming_pool, special_cast, special_cast_interval_ms, special_cast_min, special_cast_max) VALUES (
    18, 'r', TRUE, TRUE, 10, 4, 3, 0,
    'xxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxx33333333333333
xxxxxxxxxxx33333333333333
xxxxxxxxxxx33333333333333
xxxxxxxxxxx33333333333333
xxxxxxxxxxx33333333333333
xxxxxxxxxxx33333333333333
xxxxxxx333333333333333333
xxxxxxx333333333333333333
xxxxxxx333333333333333333
xxxxxxx333333333333333333
xxxxxxx333333333333333333
xxxxxxx333333333333333333
x4444433333xxxxxxxxxxxxxx
x4444433333xxxxxxxxxxxxxx
x44444333333222xx000000xx
x44444333333222xx000000xx
xxx44xxxxxxxx22xx000000xx
xxx33xxxxxxxx11xx000000xx
xxx33322222211110000000xx
xxx33322222211110000000xx
xxxxxxxxxxxxxxxxx000000xx
xxxxxxxxxxxxxxxxx000000xx
xxxxxxxxxxxxxxxxx000000xx
xxxxxxxxxxxxxxxxx000000xx
xxxxxxxxxxxxxxxxxxxxxxxxx',
    '',
    FALSE, NULL, NULL, NULL, NULL
);

INSERT OR IGNORE INTO room_models (id, name, habbo_rooms, club_only, door_x, door_y, door_height, door_direction, heightmap, public_items, swimming_pool, special_cast, special_cast_interval_ms, special_cast_min, special_cast_max) VALUES (
    19, 'newbie_lobby', FALSE, FALSE, 2, 11, 0, 2,
    'xxxxxxxxxxxxxxxx000000
xxxxx0xxxxxxxxxx000000
xxxxx00000000xxx000000
xxxxx000000000xx000000
0000000000000000000000
0000000000000000000000
0000000000000000000000
0000000000000000000000
0000000000000000000000
xxxxx000000000000000xx
xxxxx000000000000000xx
x0000000000000000000xx
x0000000000000000xxxxx
xxxxxx00000000000xxxxx
xxxxxxx0000000000xxxxx
xxxxxxxx000000000xxxxx
xxxxxxxx000000000xxxxx
xxxxxxxx000000000xxxxx
xxxxxxxx000000000xxxxx
xxxxxxxx000000000xxxxx
xxxxxxxx000000000xxxxx
xxxxxx00000000000xxxxx
xxxxxx00000000000xxxxx
xxxxxx00000000000xxxxx
xxxxxx00000000000xxxxx
xxxxxx00000000000xxxxx
xxxxx000000000000xxxxx
xxxxx000000000000xxxxx',
    'a160 crl_lamp 16 0 0 0 1
y170 crl_sofa2c 17 0 0 4 2
w180 crl_sofa2b 18 0 0 4 2
v190 crl_sofa2a 19 0 0 4 2
a200 crl_lamp 20 0 0 0 1
b161 crl_chair 16 1 0 2 2
a72 crl_lamp 7 2 0 0 1
a112 crl_lamp 11 2 0 0 1
b162 crl_chair 16 2 0 2 2
c53 crl_pillar 5 3 0 0 1
b73 crl_chair 7 3 0 2 2
u93 crl_table1b 9 3 0 0 1
s113 crl_sofa1c 11 3 0 6 2
b163 crl_chair 16 3 0 2 2
A193 crl_table2b 19 3 0 0 1
z203 crl_table2a 20 3 0 0 1
a04 crl_lamp 0 4 0 0 1
y14 crl_sofa2c 1 4 0 4 2
w24 crl_sofa2b 2 4 0 4 2
v34 crl_sofa2a 3 4 0 4 2
a44 crl_lamp 4 4 0 0 1
t94 crl_table1a 9 4 0 0 1
r114 crl_sofa1b 11 4 0 6 2
h154 crl_wall2a 15 4 0 0 1
a164 crl_lamp 16 4 0 0 1
b05 crl_chair 0 5 0 2 2
b75 crl_chair 7 5 0 2 2
q115 crl_sofa1a 11 5 0 6 2
A26 crl_table2b 2 6 0 0 1
z36 crl_table2a 3 6 0 0 1
a116 crl_lamp 11 6 0 0 1
b07 crl_chair 0 7 0 2 2
a08 crl_lamp 0 8 0 0 1
D18 crl_sofa3c 1 8 0 0 2
C28 crl_sofa3b 2 8 0 0 2
B38 crl_sofa3a 3 8 0 0 2
a48 crl_lamp 4 8 0 0 1
o198 crl_barchair2 19 8 0 0 2
p208 crl_tablebar 20 8 0 0 1
o218 crl_barchair2 21 8 0 0 2
E59 crl_pillar2 5 9 0 0 1
c99 crl_pillar 9 9 0 0 1
P815 crl_desk1a 8 15 0 0 1
O915 crl_deski 9 15 0 0 1
N1015 crl_deskh 10 15 0 0 1
M1016 crl_deskg 10 16 0 0 1
L1017 crl_deskf 10 17 0 0 1
K1018 crl_deske 10 18 0 0 1
K1019 crl_deske 10 19 0 0 1
K1020 crl_deske 10 20 0 0 1
K1021 crl_deske 10 21 0 0 1
K1022 crl_deske 10 22 0 0 1
K1023 crl_deske 10 23 0 0 1
G724 crl_wallb 7 24 0 0 1
K1024 crl_deske 10 24 0 0 1
F725 crl_walla 7 25 0 0 1
H825 crl_desk1b 8 25 0 0 1
I925 crl_desk1c 9 25 0 0 1
J1025 crl_desk1d 10 25 0 0 1
d1227 crl_lamp2 12 27 0 0 1
f1327 crl_cabinet2 13 27 0 0 1
e1427 crl_cabinet1 14 27 0 0 1
d1527 crl_lamp2 15 27 0 0 1',
    FALSE, 'sf', 5000, 1, 6
);

INSERT OR IGNORE INTO room_models (id, name, habbo_rooms, club_only, door_x, door_y, door_height, door_direction, heightmap, public_items, swimming_pool, special_cast, special_cast_interval_ms, special_cast_min, special_cast_max) VALUES (
    20, 'theater', FALSE, FALSE, 20, 27, 0, 0,
    'XXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXX
XXXXXXX111111111XXXXXXX
XXXXXXX11111111100000XX
XXXX00X11111111100000XX
XXXX00x11111111100000XX
4XXX00X11111111100000XX
4440000XXXXXXXXX00000XX
444000000000000000000XX
4XX000000000000000000XX
4XX0000000000000000000X
44400000000000000000000
44400000000000000000000
44X0000000000000000O000
44X11111111111111111000
44X11111111111111111000
33X11111111111111111000
22X11111111111111111000
22X11111111111111111000
22X11111111111111111000
22X11111111111111111000
22X11111111111111111000
22211111111111111111000
22211111111111111111000
XXXXXXXXXXXXXXXXXXXX00X
XXXXXXXXXXXXXXXXXXXX00X',
    'm1110 mic 11 10 1 0 1
d211 thchair2 2 11 4 2 2
d212 thchair2 2 12 4 2 2
d215 thchair2 2 15 4 2 2
c615 thchair1 6 15 0 0 2
c715 thchair1 7 15 0 0 2
c815 thchair1 8 15 0 0 2
c915 thchair1 9 15 0 0 2
c1015 thchair1 10 15 0 0 2
c1215 thchair1 12 15 0 0 2
c1315 thchair1 13 15 0 0 2
c1415 thchair1 14 15 0 0 2
c1515 thchair1 15 15 0 0 2
c1615 thchair1 16 15 0 0 2
d216 thchair2 2 16 4 2 2
c620 thchair1 6 20 1 0 2
c720 thchair1 7 20 1 0 2
c820 thchair1 8 20 1 0 2
c920 thchair1 9 20 1 0 2
c1020 thchair1 10 20 1 0 2
c1220 thchair1 12 20 1 0 2
c1320 thchair1 13 20 1 0 2
c1420 thchair1 14 20 1 0 2
c1520 thchair1 15 20 1 0 2
c1620 thchair1 16 20 1 0 2
c623 thchair1 6 23 1 0 2
c723 thchair1 7 23 1 0 2
c823 thchair1 8 23 1 0 2
c923 thchair1 9 23 1 0 2
c1023 thchair1 10 23 1 0 2
c1223 thchair1 12 23 1 0 2
c1323 thchair1 13 23 1 0 2
c1423 thchair1 14 23 1 0 2
c1523 thchair1 15 23 1 0 2
c1623 thchair1 16 23 1 0 2
c626 thchair1 6 26 1 0 2
c726 thchair1 7 26 1 0 2
c826 thchair1 8 26 1 0 2
c926 thchair1 9 26 1 0 2
c1026 thchair1 10 26 1 0 2
c1226 thchair1 12 26 1 0 2
c1326 thchair1 13 26 1 0 2
c1426 thchair1 14 26 1 0 2
c1526 thchair1 15 26 1 0 2
c1626 thchair1 16 26 1 0 2',
    FALSE, 'sf', 5000, 1, 6
);

INSERT OR IGNORE INTO room_models (id, name, habbo_rooms, club_only, door_x, door_y, door_height, door_direction, heightmap, public_items, swimming_pool, special_cast, special_cast_interval_ms, special_cast_min, special_cast_max) VALUES (
    21, 'library', FALSE, FALSE, 20, 3, 1, 0,
    'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxx11111xx1xx1x111111x
xxxxxxxxxxxx111111xx1xx11111111x
xx111xxxxxxx111111xx1xx11111111x
xx111xxxxxxx1111111111111111111x
xx111xxxxxxx1111111111111111111x
xx111xxxxxxx1111111111111111111x
xx111xxxxxxx1111111111111xxxxxxx
xx111xxxxxx11111111111111111111x
xx111xxxxxx11111111111111111111x
xx111xxxxxx11111111111111111111x
xx111xxxxxx11111111111111xxxxxxx
xx111xxxxxxxx111111111111111111x
xx111xx11111x111111111111111111x
xx111xx11111x111111111111111111x
xx111xxxxx11x11111111x111xxxxxxx
xx111xxxxxxxx11111111xx11111111x
xx111xxx1111111111111xxx1111111x
xx111xxx1111111111111xxxx111111x
xxx111xx1111111111x11xxxx000000x
xxxxx1111xx1111111x11xxxx000000x
xxxxxxxxxxxx111111x11xxxx000000x
xxxxxxxxxxxx11xx11x11xxxx000000x
xxxxxxxxxxxx11xx11x11xxxx000000x
xxxxxxxxxxxx11xx11x11xxxx000000x
xxxxxxxxxxxx11xx11x11xxxx000000x
xxxxxxxxxxxx11xx11x11xxxx000000x
xxxxxxxxxxxx11xx11x111xxx000000x
xxxxxxxxxxxxxxxxxxxx11xxx000000x
xxxxxxxxxxxxxxxxxxxx11xxxxxxxxxx
xxxxxxxxxxxxxxxxxxxx22222xxxxxxx
xxxxxxxxxxxxxxxxxxxx22222xxxxxxx
xxxxxxxxxxxxxxxxxxxx22222xxxxxxx
xxxxxxxxxxxxxxxxxxxx22222xxxxxxx
xxxxxxxxxxxxxxxxxxxx22222xxxxxxx
xxxxxxxxxxxxxxxxxxxx22222xxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    'a142 libchair 14 2 1 4 2
a162 libchair 16 2 1 4 2
a262 libchair 26 2 1 4 2
a243 libchair 24 3 1 2 2
a124 libchair 12 4 1 2 2
a126 libchair 12 6 1 2 2
b1314 libstool 13 14 1 6 2
b1315 libstool 13 15 1 6 2
b1316 libstool 13 16 1 6 2
a2827 libchair 28 27 0 4 2
a2729 libchair 27 29 0 2 2
b2433 libstool 24 33 2 6 2
b2434 libstool 24 34 2 6 2
b2435 libstool 24 35 2 6 2
b2136 libstool 21 36 2 0 2
b2236 libstool 22 36 2 0 2
b2336 libstool 23 36 2 0 2',
    FALSE, 'sf', 5000, 1, 6
);

INSERT OR IGNORE INTO room_models (id, name, habbo_rooms, club_only, door_x, door_y, door_height, door_direction, heightmap, public_items, swimming_pool, special_cast, special_cast_interval_ms, special_cast_min, special_cast_max) VALUES (
    22, 'floatinggarden', FALSE, FALSE, 2, 21, 5, 0,
    'xxxxxxxxxxxxxxxx333333xxxxxxxxx
xxxxxxxxxxxxxxxx3xxxx3xxxxxxxxx
xxxxxxxxxxxxxxxx3xxxx3xxxxxxxxx
xxxxxxxxxxxxxxxx3xxxx3xxxxxxxxx
xxxxxxxxxxxxxxx223xxx33xxxxxxxx
xxxxxxxxxxxxxxx11xxx33333xxxxxx
xxxxxxxxxxxxxxxx11xx3333333xxxx
xxxxxxxxxxxxxxxx11xx33333333xxx
xxxxxxxxxxxxxxxxx11xxxxxxxx3xxx
xxxxxxxxxxxxxxxxxx11xxxx3333xxx
xxxxxxxxxxxxxxxxxxx1xxxx33333xx
xxxxxxxxxxxxxxxxxxx1xxx3333333x
555xxxxxxxxxxx1111111x333333333
555xxxxxxxxxxx21111111xxxxxx333
555xxxxxxxxxxx22111111111xxxxxx
555xxxxxxxxxxx222xxxxxxx111xxxx
555xxxxxxxxxxx22xxxxxxxxxx1xxxx
555xxxxxxxxxxx23333333333x111xx
555xxxxxxxx33333333333333x111xx
555xxxxxxxx333333x3333333x111xx
555xxxxxxxx33333333333333x111xx
555xxxxxxxx33x33333333333x111xx
555xxxxxxxx33x33x33333333x111xx
555xxxxxxxx33x33x33333333x111xx
5554333333333x333x3333333x111xx
x554333333xxxx33xxxxxxxxxx111xx
xxxxxxxxx3xxxx333221111111111xx
xxxxxxxxx3xxxx333221111111111xx
xxxxxxxxx33333333xx1111x11x11xx
xxxxxxxxx33333333111xxx11xxxxxx
xxxxxxxxxxxxxx33311xxxx11xxxxxx
xxxxxxxxxxxxxx33311xxxx11xxxxxx
xxxxxxxxxxxxxx333x1xxxx11xxxxxx
xxxxxxxxxxxxxx333x1xx111111xxxx
xxxxxxxxxxxxxx33311xx111111xxxx
xxxxxxxxxx333333311xx111111xxxx
xxxxxxxxxxx33333311xx111111xxxx
xxxxxxxxxxxxxxxx111xxxxxxxxxxxx
xxxxxxxxxxxxxxx111xxxxxxxxxxxxx',
    'a249 float_dummychair 24 9 3 4 2
a259 float_dummychair 25 9 3 4 2
b2813 float_dummychair2 28 13 3 4 2
b2913 float_dummychair2 29 13 3 4 2
e1717 floatbench2 17 17 3 2 2
e1917 floatbench2 19 17 3 6 2
e2117 floatbench2 21 17 3 2 2
e2317 floatbench2 23 17 3 6 2
e2717 floatbench2 27 17 1 4 2
d2817 floatbench1 28 17 1 4 2
d1718 floatbench1 17 18 3 2 2
d1918 floatbench1 19 18 3 6 2
d2118 floatbench1 21 18 3 2 2
d2318 floatbench1 23 18 3 6 2
e2719 floatbench2 27 19 1 0 2
d2819 floatbench1 28 19 1 0 2
e1723 floatbench2 17 23 3 2 2
e1923 floatbench2 19 23 3 6 2
e2123 floatbench2 21 23 3 2 2
e2323 floatbench2 23 23 3 6 2
e2723 floatbench2 27 23 1 4 2
d2823 floatbench1 28 23 1 4 2
d1724 floatbench1 17 24 100000 2 2
d1924 floatbench1 19 24 3 6 2
d2124 floatbench1 21 24 3 2 2
d2324 floatbench1 23 24 3 6 2
e2725 floatbench2 27 25 1 0 2
d2825 floatbench1 28 25 1 0 2
a1729 float_dummychair 17 29 1 2 2
a1730 float_dummychair 17 30 1 2 2
a1731 float_dummychair 17 31 1 2 2
a2133 float_dummychair 21 33 1 2 2
a2633 float_dummychair 26 33 1 6 2
a2134 float_dummychair 21 34 1 2 2
a2634 float_dummychair 26 34 1 6 2
a1735 float_dummychair 17 35 1 2 2
a2135 float_dummychair 21 35 1 2 2
a2635 float_dummychair 26 35 1 6 2
a1736 float_dummychair 17 36 1 2 2
a2136 float_dummychair 21 36 1 2 2
a2636 float_dummychair 26 36 1 6 2
a1537 float_dummychair 15 37 100000 4 2
a1637 float_dummychair 16 37 1 4 2',
    FALSE, 'sf', 5000, 1, 6
);

INSERT OR IGNORE INTO room_models (id, name, habbo_rooms, club_only, door_x, door_y, door_height, door_direction, heightmap, public_items, swimming_pool, special_cast, special_cast_interval_ms, special_cast_min, special_cast_max) VALUES (
    23, 'sunset_cafe', FALSE, FALSE, 34, 40, 0, 4,
    'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx000000xxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx0000000xxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxx00000xx00000000xxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxx000000000000000000xxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxx000000000000000000xxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxx000000000000000000xxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxx000000000000000000xxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxx00000000xxx0000000xxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxx00000000xxxx000000xxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxx00000000xxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxx0000000000000000xxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxx00000000000000000xxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxx00000000000000000xxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxx00000000000000000xxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxx00000000000000000xxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxx00000000000000000xxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx00000000xxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx0000000xxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx0000xxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx0000xxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx0000xxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    'd3221 chairup4 32 21 0 3 2
f3321 chairup6 33 21 0 4 2
f3421 chairup6 34 21 0 4 2
f3521 chairup6 35 21 0 4 2
f3621 chairup6 36 21 0 4 2
g3721 chairup7 37 21 0 4 2
b3222 chairup2 32 22 0 2 2
e2523 chairup5 25 23 0 4 2
f2623 chairup6 26 23 0 4 2
f2723 chairup6 27 23 0 4 2
f2823 chairup6 28 23 0 4 2
g2923 chairup7 29 23 0 4 2
a3223 chairup1 32 23 0 2 2
A2424 counter5 24 24 0 7 1
r2524 table2 25 24 0 7 1
q2624 table1 26 24 0 7 1
p2425 counter3 24 25 0 7 1
z2426 counter4 24 26 0 7 1
p2427 counter3 24 27 0 7 1
p2428 counter3 24 28 0 7 1
y2928 palms4 29 28 0 7 1
p2429 counter3 24 29 0 7 1
x2929 palms3 29 29 0 7 1
p2430 counter3 24 30 0 7 1
w2930 palms2 29 30 0 7 1
n2231 counter1 22 31 0 7 1
n2331 counter1 23 31 0 7 1
o2431 counter2 24 31 0 7 1
v2931 palms1 29 31 0 7 1
e3031 chairup5 30 31 0 4 2
f3131 chairup6 31 31 0 4 2
f3231 chairup6 32 31 0 4 2
f3331 chairup6 33 31 0 4 2
f3431 chairup6 34 31 0 4 2
f3531 chairup6 35 31 0 4 2
f3631 chairup6 36 31 0 4 2
j3731 chairright3 37 31 0 5 2
c2132 chairup3 21 32 0 2 2
t2232 table4 22 32 0 7 1
r3032 table2 30 32 0 7 1
q3132 table1 31 32 0 7 1
r3332 table2 33 32 0 7 1
q3432 table1 34 32 0 7 1
i3732 chairright2 37 32 0 6 2
b2133 chairup2 21 33 0 2 2
s2233 table3 22 33 0 7 1
i3733 chairright2 37 33 0 6 2
b2134 chairup2 21 34 0 2 2
t3634 table4 36 34 0 7 1
i3734 chairright2 37 34 0 6 2
b2135 chairup2 21 35 0 2 2
r2435 table2 24 35 0 7 1
q2535 table1 25 35 0 7 1
r2735 table2 27 35 0 7 1
q2835 table1 28 35 0 7 1
u3335 palm 33 35 0 7 1
s3635 table3 36 35 0 7 1
i3735 chairright2 37 35 0 6 2
m2136 chairleft3 21 36 0 1 2
l2236 chairleft2 22 36 0 0 2
l2336 chairleft2 23 36 0 0 2
l2436 chairleft2 24 36 0 0 2
l2536 chairleft2 25 36 0 0 2
l2636 chairleft2 26 36 0 0 2
l2736 chairleft2 27 36 0 0 2
k2836 chairleft1 28 36 0 0 2
i3736 chairright2 37 36 0 6 2
t3637 table4 36 37 0 7 1
i3737 chairright2 37 37 0 6 2
s3638 table3 36 38 0 7 1
h3738 chairright1 37 38 0 6 2',
    FALSE, 'sf', 5000, 1, 6
);

INSERT OR IGNORE INTO room_models (id, name, habbo_rooms, club_only, door_x, door_y, door_height, door_direction, heightmap, public_items, swimming_pool, special_cast, special_cast_interval_ms, special_cast_min, special_cast_max) VALUES (
    24, 'pool_a', FALSE, FALSE, 2, 25, 7, 2,
    'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxx7xxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxx777xxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxx7777777xxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxx77777777xxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxx77777777xxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxx777777777xxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxx7xxx777777xxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxx7x777777777xxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxx7xxx77777777xxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxx7x777777777x7xxxxxxxxxxxxxxx
xxxxxxxxxxxxxxx7xxx7777777777xxxxxxxxxxxxxx
xxxxxxxxxxxxxxx777777777777xxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxx77777777777x2111xxxxxxxxxxxx
xxxxxxxxxxxxxxx7777777777x221111xxxxxxxxxxx
xxxxxxxxx7777777777777777x2211111xxxxxxxxxx
xxxxxxxxx7777777777777777x22211111xxxxxxxxx
xxxxxxxxx7777777777777777x222211111xxxxxxxx
xxxxxx77777777777777777777x222211111xxxxxxx
xxxxxx7777777xx777777777777x222211111xxxxxx
xxxxxx7777777xx77777777777772222111111xxxxx
xxxxxx777777777777777777777x22221111111xxxx
xx7777777777777777777777x322222211111111xxx
77777777777777777777777x33222222111111111xx
7777777777777777777777x333222222211111111xx
xx7777777777777777777x333322222222111111xxx
xx7777777777777777777333332222222221111xxxx
xx777xxx777777777777733333222222222211xxxxx
xx777x7x77777777777773333322222222222xxxxxx
xx777x7x7777777777777x33332222222222xxxxxxx
xxx77x7x7777777777777xx333222222222xxxxxxxx
xxxx77777777777777777xxx3222222222xxxxxxxxx
xxxxx777777777777777777xx22222222xxxxxxxxxx
xxxxxx777777777777777777x2222222xxxxxxxxxxx
xxxxxxx777777777777777777222222xxxxxxxxxxxx
xxxxxxxx7777777777777777722222xxxxxxxxxxxxx
xxxxxxxxx77777777777777772222xxxxxxxxxxxxxx
xxxxxxxxxx777777777777777222xxxxxxxxxxxxxxx
xxxxxxxxxxx77777777777777x2xxxxxxxxxxxxxxxx
xxxxxxxxxxxx77777777777777xxxxxxxxxxxxxxxxx
xxxxxxxxxxxxx777777777777xxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxx7777777777xxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxx77777777xxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxx777777xxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxx7777xxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxx77xxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    'u184 umbrella2 18 4 7 0 1
b185 pool_2sofa2 18 5 7 2 2
B186 pool_2sofa1 18 6 7 2 2
u720 umbrella2 7 20 7 0 1
c820 pool_chair2 8 20 7 4 2
u2420 umbrella2 24 20 7 0 1
c2520 pool_chair2 25 20 7 4 2
c721 pool_chair2 7 21 7 2 2
t821 pool_table2 8 21 7 0 2
c921 pool_chair2 9 21 7 6 2
c2421 pool_chair2 24 21 7 2 2
t2521 pool_table2 25 21 7 0 1
c822 pool_chair2 8 22 7 0 2
R228 flower2b 2 28 7 0 1
r229 flower2a 2 29 7 0 1
L632 box 6 32 7 0 1
f1333 flower1 13 33 7 0 1
y1034 pool_chairy 10 34 7 4 2
8835 umbrellay 8 35 7 0 1
y935 pool_chairy 9 35 7 2 2 2
Q1035 pool_tabley 10 35 7 0 1
y1135 pool_chairy 11 35 7 6 2
91535 umbrellap 15 35 7 0 1
72135 umbrellao 21 35 7 0 1
y1036 pool_chairy 10 36 7 0 2
P1536 pool_chairp 15 36 7 4 2
o2136 pool_chairo 21 36 7 4 2
o2236 pool_chairo 22 36 7 4 2
P1437 pool_chairp 14 37 7 2 2
Z1537 pool_tablep 15 37 7 0 1
P1637 pool_chairp 16 37 7 6 2
K2137 pool_tabo 21 37 7 6 1
k2237 pool_tabo2 22 37 7 6 1
P1438 pool_chairp 14 38 7 2 2
z1538 pool_tablep2 15 38 7 0 1
P1638 pool_chairp 16 38 7 6 2
o2138 pool_chairo 21 38 7 0 2
o2238 pool_chairo 22 38 7 0 2
P1539 pool_chairp 15 39 7 0 2
g2041 pool_chairg 20 41 7 4 2
g2141 pool_chairg 21 41 7 4 2
W2042 pool_tablg 20 42 7 6 1
w2142 pool_tablg2 21 42 7 6 1
G1943 umbrellag 19 43 7 0 1
g2043 pool_chairg 20 43 7 0 2
g2143 pool_chairg 21 43 7 0 2',
    TRUE, 'sf', 5000, 1, 6
);

INSERT OR IGNORE INTO room_models (id, name, habbo_rooms, club_only, door_x, door_y, door_height, door_direction, heightmap, public_items, swimming_pool, special_cast, special_cast_interval_ms, special_cast_min, special_cast_max) VALUES (
    25, 'pub_a', FALSE, FALSE, 15, 25, 0, 6,
    'xxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxx2222222211111xxx
xxxxxxxxx2222222211111xxx
xxxxxxxxx2222222211111xxx
xxxxxxxxx2222222211111xxx
xxxxxxxxx2222222222111xxx
xxxxxxxxx2222222222111xxx
xxxxxxxxx2222222222000xxx
xxxxxxxxx2222222222000xxx
xxxxxxxxx2222222222000xxx
xxxxxxxxx2222222222000xxx
x333333332222222222000xxx
x333333332222222222000xxx
x333333332222222222000xxx
x333333332222222222000xxx
x333333332222222222000xxx
x333332222222222222000xxx
x333332222222222222000xxx
x333332222222222222000xxx
x333332222222222222000xxx
x333333332222222222000xxx
xxxxx31111112222222000xxx
xxxxx31111111000000000xxx
xxxxx31111111000000000xxx
xxxxx31111111000000000xxx
xxxxx31111111000000000xxx
xxxxxxxxxxxxxxx00xxxxxxxx
xxxxxxxxxxxxxxx00xxxxxxxx
xxxxxxxxxxxxxxx00xxxxxxxx
xxxxxxxxxxxxxxx00xxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxx',
    'S191 pub_sofa2 19 1 1 4 1
s201 pub_sofa 20 1 1 4 2
s211 pub_sofa 21 1 1 4 2
q112 bardesk1 11 2 2 0 1
c122 pub_chair 12 2 2 6 2
Q113 bardesk2 11 3 2 0 1
q114 bardesk1 11 4 2 0 1
c124 pub_chair 12 4 2 6 2
Q115 bardesk2 11 5 2 0 1
f185 pub_fence 18 5 2 1 1
q116 bardesk1 11 6 2 0 1
c126 pub_chair 12 6 2 6 2
f186 pub_fence 18 6 2 0 1
Q117 bardesk2 11 7 2 0 1
f187 pub_fence 18 7 2 0 1
q118 bardesk1 11 8 2 0 1
c128 pub_chair 12 8 2 6 2
f188 pub_fence 18 8 2 0 1
w109 bardesk4 10 9 2 0 1
W119 bardesk3 11 9 2 0 1
f189 pub_fence 18 9 2 0 1
f1810 pub_fence 18 10 2 0 1
C211 pub_chair2 2 11 3 4 2
C311 pub_chair2 3 11 3 4 2
C511 pub_chair2 5 11 3 4 2
C611 pub_chair2 6 11 3 4 2
f811 pub_fence 8 11 3 1 1
f1811 pub_fence 18 11 2 0 1
f812 pub_fence 8 12 3 0 1
f1812 pub_fence 18 12 2 0 1
f813 pub_fence 8 13 3 0 1
C913 pub_chair2 9 13 2 2 2
k1413 pub_chair3 14 13 2 2 2
T1513 pub_table2 15 13 2 1 1
k1613 pub_chair3 16 13 2 6 2
f1813 pub_fence 18 13 2 0 1
f814 pub_fence 8 14 3 2 1
C914 pub_chair2 9 14 2 2 2
k1414 pub_chair3 14 14 2 2 2
T1514 pub_table2 15 14 2 2 1
k1614 pub_chair3 16 14 2 6 2
f1814 pub_fence 18 14 2 0 1
t115 pub_table 1 15 3 0 1
f515 pub_fence 5 15 3 1 1
f1815 pub_fence 18 15 2 0 1
S116 pub_sofa2 1 16 3 2 2
f516 pub_fence 5 16 3 0 1
f1816 pub_fence 18 16 2 0 1
s117 pub_sofa 1 17 3 2 2
f517 pub_fence 5 17 3 0 1
k1317 pub_chair3 13 17 2 4 2
k1417 pub_chair3 14 17 2 4 2
k1517 pub_chair3 15 17 2 4 2
k1617 pub_chair3 16 17 2 4 2
f1817 pub_fence 18 17 2 0 1
s118 pub_sofa 1 18 3 2 2
f518 pub_fence 5 18 3 0 1
T1318 pub_table2 13 18 2 5 1
T1418 pub_table2 14 18 2 6 1
T1518 pub_table2 15 18 2 6 1
T1618 pub_table2 16 18 2 4 1
f1818 pub_fence 18 18 2 0 1
s219 pub_sofa 2 19 3 0 2
S319 pub_sofa2 3 19 3 0 2
f519 pub_fence 5 19 3 0 1
k1319 pub_chair3 13 19 2 0 2
k1419 pub_chair3 14 19 2 0 2
k1519 pub_chair3 15 19 2 0 2
k1619 pub_chair3 16 19 2 0 2
f1819 pub_fence 18 19 2 0 1
f120 pub_fence 1 20 3 5 1
f220 pub_fence 2 20 3 6 1
f320 pub_fence 3 20 3 6 1
f420 pub_fence 4 20 3 6 1
f520 pub_fence 5 20 3 3 1
f1820 pub_fence 18 20 2 0 1
S721 pub_sofa2 7 21 1 4 2
s821 pub_sofa 8 21 1 4 2
f1221 pub_fence 12 21 2 5 1
f1321 pub_fence 13 21 2 6 1
f1421 pub_fence 14 21 2 6 1
f1521 pub_fence 15 21 2 6 1
f1621 pub_fence 16 21 2 6 1
f1721 pub_fence 17 21 2 6 1
f1821 pub_fence 18 21 2 3 1
S622 pub_sofa2 6 22 1 2 2
t1522 pub_table 15 22 0 0 1
C1622 pub_chair2 16 22 0 4 2
C1722 pub_chair2 17 22 0 4 2
s623 pub_sofa 6 23 1 2 2
T823 pub_table2 8 23 1 1 1
s624 pub_sofa 6 24 1 2 2
T824 pub_table2 8 24 1 0 1
s625 pub_sofa 6 25 1 2 2
T825 pub_table2 8 25 1 2 1',
    FALSE, 'sf', 5000, 1, 6
);

INSERT OR IGNORE INTO room_models (id, name, habbo_rooms, club_only, door_x, door_y, door_height, door_direction, heightmap, public_items, swimming_pool, special_cast, special_cast_interval_ms, special_cast_min, special_cast_max) VALUES (
    26, 'md_a', FALSE, FALSE, 1, 5, 7, 2,
    'xxxxxxxx77xxxxxxxxxxxxxxxx
xxxxxxxx77xxxxxxxxxxxxxxxx
xxxxxx77777x77xxxxxxxxxxxx
xxx77777777777xxx44xxxxxxx
77777777777777xx444444444x
777777777777777xx44444444x
xxx777777777777xx44444444x
xxxx7777777777xxx44444444x
7777777777777777744448444x
7777777777777x4x744448444x
777777777777x444444448444x
7777777777774444444448444x
7777777777774444444448444x
777777777777x444444448444x
7777777777777x44444448444x
xxx777777777777x444448444x
xxx7777777777777444448444x
xxx7777777777777444448444x
xxx777777777777x444448444x
xxx77777777777x4444444444x
xxxx777777777444444444444x
xxxxxxxxxxxxxxxxxxxxxxxxxx',
    'A43 mntdwchair 4 3 7 4 2
A53 mntdwchair 5 3 7 4 2
M28 barmask 2 8 7 0 1
s78 mntdwsofa2 7 8 7 2 2
t88 mntdwtable2 8 8 7 0 2
s98 mntdwsofa2 9 8 7 6 2
y218 paalu5 21 8 8 0 1
M29 barmask 2 9 7 0 1
S79 mntdwsofa1 7 9 7 2 2
T89 mntdwtable1 8 9 7 0 2
S99 mntdwsofa1 9 9 7 6 2
y219 paalu5 21 9 8 0 1
M210 barmask 2 10 7 0 1
y2110 paalu5 21 10 8 0 1
M211 barmask 2 11 7 0 1
y2111 paalu5 21 11 8 0 1
M212 barmask 2 12 7 0 1
s712 mntdwsofa2 7 12 7 4 2
S812 mntdwsofa1 8 12 7 4 2
e2112 paalu3 21 12 8 0 1
M213 barmask 2 13 7 0 1
t713 mntdwtable2 7 13 7 2 1
T813 mntdwtable1 8 13 7 2 1
e2113 paalu3 21 13 8 0 1
M214 barmask 2 14 7 0 1
s714 mntdwsofa2 7 14 7 0 2
S814 mntdwsofa1 8 14 7 0 2
e2114 paalu3 21 14 8 0 1
M215 barmask 2 15 100000 0 1
q2115 paalu1 21 15 8 0 1
M216 barmask 2 16 100000 0 1
s1216 mntdwsofa2 12 16 7 4 2
S1316 mntdwsofa1 13 16 7 4 2
q2116 paalu1 21 16 8 0 1
A317 mntdwchair 3 17 7 2 2
s617 mntdwsofa2 6 17 7 2 2
t717 mntdwtable2 7 17 7 0 1
s817 mntdwsofa2 8 17 7 6 2
t1217 mntdwtable2 12 17 7 2 1
T1317 mntdwtable1 13 17 7 2 1
q2117 paalu1 21 17 8 0 1
A318 mntdwchair 3 18 7 2 2
S618 mntdwsofa1 6 18 7 2 2
T718 mntdwtable1 7 18 7 0 1
S818 mntdwsofa1 8 18 7 6 2
s1218 mntdwsofa2 12 18 7 0 2
S1318 mntdwsofa1 13 18 7 0 2
q2118 paalu1 21 18 8 0 1',
    TRUE, 'cam1', 4500, 1, 4
);

INSERT OR IGNORE INTO room_models (id, name, habbo_rooms, club_only, door_x, door_y, door_height, door_direction, heightmap, public_items, swimming_pool, special_cast, special_cast_interval_ms, special_cast_min, special_cast_max) VALUES (
    27, 'picnic', FALSE, FALSE, 16, 5, 2, 4,
    'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xx22222xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
22xxxxxxxxxxxxx22xxxxxxxxxxxxxxxxxxxxx
2222222222222222222x222222222222222222
22222222222222222222222222222222222222
22222222222222222222222222222222222222
22222222222222222222222222222222222222
22222222222xxx222222222222222222222222
2222222222xx33x22222222222222222222222
222222222xx3333x2222222222222222222222
222222222x333333x222222222222222222222
222222222x333333x222222222222222222222
2222222222x3332x2222222222222222222222
22222222222x33x22222222222222222222222
22222222222222222222222222222222222222
22222222222222222222222222222222222222
22222222222222222222222222222222222222
22222222222222222222222222222222222222
22222222222222222222222222222222222222
22222222222222222222222222222222222222
22222222x22222xxxx22222222222222222222
22222222222222xxxx22222222222222222222
22222222222222xxx222222222222222222222
22222222222222222222222222222222222222
22222222222222222222222222222222222222
22222222222222222222222222222222222222
22222222222222222222222222222222222222
22222222222222222222222222222222222222
22222222222222222222222222222222222222
22222222222222222222222222222222222222
22222222222222222222222222222222222222
22222222222222222222222222222222222222
22222222222222222222222222222222222222
22222222222222222222222222222222222222
22222222222222222222222222222222222222
22222222222222222222222222222222222222
22222222222222222222222222222222222222
22222222222222222222222222222222222222
22222222222222222222222222222222222222
22222222222222222222222222222222222222
22222222222222222222222222222222222222',
    'h107 hedge7 10 7 2 4 1
h117 hedge7 11 7 2 4 1
h127 hedge7 12 7 2 4 1
h137 hedge7 13 7 2 4 1
y147 hedge8 14 7 2 4 1
s187 hedge2 18 7 2 4 1
h197 hedge7 19 7 2 4 1
h207 hedge7 20 7 2 4 1
h217 hedge7 21 7 2 4 1
z148 hedge9 14 8 2 4 1
z188 hedge9 18 8 2 4 1
v39 hedge5 3 9 2 4 1
z310 hedge9 3 10 2 4 1
c1211 picnic_dummychair1 12 11 3 4 2
c1311 picnic_dummychair1 13 11 3 4 2
c1411 picnic_dummychair1 14 11 100000 4 2
c1013 picnic_dummychair1 10 13 3 2 2
c1513 picnic_dummychair1 15 13 3 6 2
b2113 picnic_ground 21 13 2 4 2
b714 picnic_ground 7 14 2 4 2
c1014 picnic_dummychair1 10 14 3 2 2
c1514 picnic_dummychair1 15 14 3 6 2
b1915 picnic_ground 19 15 2 2 2
b2315 picnic_ground 23 15 2 6 2
b516 picnic_ground 5 16 2 2 2
b916 picnic_ground 9 16 2 6 2
L2016 picnic_cloth1 20 16 2 2 1
L617 picnic_cloth1 6 17 2 2 1
b2117 picnic_ground 21 17 2 0 2
b718 picnic_ground 7 18 2 0 2
a019 picnic_redbench2 0 19 2 2 2
A020 picnic_redbench1 0 20 2 2 2
w1120 hedge6 11 20 2 4 1
h1220 hedge7 12 20 2 4 1
h1320 hedge7 13 20 2 4 1
t1420 hedge3 14 20 2 4 1
u1720 hedge4 17 20 2 4 1
h1820 hedge7 18 20 2 4 1
h1920 hedge7 19 20 2 4 1
y2020 hedge8 20 20 2 4 1
v1121 hedge5 11 21 2 4 1
M1221 picnic_bench1 12 21 2 4 2
N1321 picnic_bench2 13 21 2 4 2
O1421 picnic_bench3 14 21 2 4 2
M1721 picnic_bench1 17 21 2 4 2
N1821 picnic_bench2 18 21 2 4 2
O1921 picnic_bench3 19 21 2 4 2
v2021 hedge5 20 21 2 4 1
a022 picnic_redbench2 0 22 2 2 2
v1122 hedge5 11 22 2 4 1
v2022 hedge5 20 22 2 4 1
b2522 picnic_ground 25 22 2 4 1
A023 picnic_redbench1 0 23 2 2 2
v1123 hedge5 11 23 2 4 1
M1223 picnic_bench1 12 23 2 2 2
M1923 picnic_bench1 19 23 2 6 2
v2023 hedge5 20 23 2 4 1
c624 picnic_dummychair1 6 24 2 4 2
d724 picnic_dummychair4 7 24 2 4 2
e824 picnic_dummychair6 8 24 2 4 2
v1124 hedge5 11 24 2 4 1
N1224 picnic_bench2 12 24 2 2 2
N1924 picnic_bench2 19 24 2 6 2
v2024 hedge5 20 24 2 4 1
b2324 picnic_ground 23 24 2 2 2
b2724 picnic_ground 27 24 2 6 2
K525 picnic_stump 5 25 2 2 2
v1125 hedge5 11 25 2 4 1
N1225 picnic_bench2 12 25 2 2 2
N1925 picnic_bench2 19 25 2 6 2
v2025 hedge5 20 25 2 4 1
G2425 picnic_cloth2 24 25 2 2 1
K726 picnic_stump 7 26 2 0 2
v1126 hedge5 11 26 2 4 1
O1226 picnic_bench3 12 26 2 2 2
H1426 picnic_fireplace1 14 26 2 0 1
I1626 picnic_fireplace2 16 26 2 2 1
O1926 picnic_bench3 19 26 2 6 2
v2026 hedge5 20 26 2 4 1
b2526 picnic_ground 25 26 2 0 1
z1127 hedge9 11 27 2 4 1
Q1227 picnic_lemonade 12 27 2 4 1
z2027 hedge9 20 27 2 4 1
E829 picnic_firewood2 8 29 2 0 1
a030 picnic_redbench2 0 30 2 2 2
D830 picnic_firewood1 8 30 2 0 1
A031 picnic_redbench1 0 31 2 2 2
D831 picnic_firewood1 8 31 2 0 1
M1231 picnic_bench1 12 31 2 4 2
N1331 picnic_bench2 13 31 2 4 2
O1431 picnic_bench3 14 31 2 4 2
M1831 picnic_bench1 18 31 2 4 2
N1931 picnic_bench2 19 31 2 4 2
O2031 picnic_bench3 20 31 2 4 2
f2731 picnic_carrot 27 31 2 0 1
f2831 picnic_carrot 28 31 2 0 1
f2931 picnic_carrot 29 31 2 0 1
f3031 picnic_carrot 30 31 2 0 1
f3131 picnic_carrot 31 31 2 0 1
D832 picnic_firewood1 8 32 2 0 1
F1232 picnic_table2 12 32 2 2 1
P1432 picnic_table 14 32 2 2 1
F1832 picnic_table2 18 32 2 2 1
P2032 picnic_table 20 32 2 2 1
r333 hedge1 3 33 2 4 1
D833 picnic_firewood1 8 33 2 0 1
M1233 picnic_bench1 12 33 2 0 2
N1333 picnic_bench2 13 33 2 0 2
O1433 picnic_bench3 14 33 2 0 2
M1833 picnic_bench1 18 33 2 0 2
N1933 picnic_bench2 19 33 2 0 2
O2033 picnic_bench3 20 33 2 0 2
g2733 picnic_cabbage 27 33 2 0 1
g2833 picnic_cabbage 28 33 2 0 1
g2933 picnic_cabbage 29 33 2 0 1
v334 hedge5 3 34 2 4 1
D834 picnic_firewood1 8 34 2 0 1
v335 hedge5 3 35 2 4 1
D835 picnic_firewood1 8 35 2 0 1
v336 hedge5 3 36 2 4 1
D836 picnic_firewood1 8 36 2 0 1
D837 picnic_firewood1 8 37 2 0 1
M1237 picnic_bench1 12 37 2 4 2
N1337 picnic_bench2 13 37 2 4 2
O1437 picnic_bench3 14 37 2 4 2
M1837 picnic_bench1 18 37 2 4 2
N1937 picnic_bench2 19 37 2 4 2
O2037 picnic_bench3 20 37 2 4 2
D838 picnic_firewood1 8 38 2 0 1
F1238 picnic_table2 12 38 2 2 1
P1438 picnic_table 14 38 2 2 1
F1838 picnic_table2 18 38 2 2 1
P2038 picnic_table 20 38 2 2 1
J839 picnic_firewood3 8 39 2 0 1
M1239 picnic_bench1 12 39 2 0 2
N1339 picnic_bench2 13 39 2 0 2
O1439 picnic_bench3 14 39 2 0 2
M1839 picnic_bench1 18 39 2 0 2
N1939 picnic_bench2 19 39 2 0 2
O2039 picnic_bench3 20 39 2 0 2',
    FALSE, 'sf', 5000, 1, 6
);

INSERT OR IGNORE INTO room_models (id, name, habbo_rooms, club_only, door_x, door_y, door_height, door_direction, heightmap, public_items, swimming_pool, special_cast, special_cast_interval_ms, special_cast_min, special_cast_max) VALUES (
    28, 'park_a', FALSE, FALSE, 2, 15, 0, 6,
    'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx0xxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx00xxxxxxxxxxxx
xxxxxxxxxxxxx0x00xxxxxxxxxxx0x000xxxxxxxxxxx
xxxxxxxxxxxx0000000000000000000000xxxxxxxxxx
xxxxxxxxxxx000000000000000000000000xxxxxxxxx
xxxxxxxxxxx0000000000000000000000000xxxxxxxx
xxxxxxxxxxx00000000000000000000000000xxxxxxx
xxxxxxxx000000000000000000000000000000xxxxxx
xxxxxxx00000000000000000000000000000000xxxxx
xxxxxxx000000000000000000000000000000000xxxx
xxxxxxx0000000000000000000000000000000000xxx
xxxxxxxxx000000000000000000000000000000000xx
00000000000000000000xx00000000000000000000xx
0000000000000000000xxxx00000000000xxxxxxx0xx
0000000000000000000xxxx00000000000x00000xxxx
xxxxx00x0000000000xxxxx0xxxxxx0000x0000000xx
xxxxx0000000000000xxxxx0xx000x0000x000000xxx
xxxxx0000000000000xxxxx0x000000000x00000xxxx
xxxxx000000x0000000xxxx0x000000000xxx00xxxxx
xxxxxxxx000x0000000xxx00xxx000000x0000xxxxxx
xxxxxxxx000x000000xxxx0x0000000000000xxxxxxx
xxxxxxxx000x000000011100000000000000xxxxxxxx
xxxxxxxx000x00000001110000000000000xxxxxxxxx
xxxxxxxxx00x0000000111x00000000x00xxxxxxxxxx
xxxxxxxxxx0x0000000xxx0000000xxxxxxxxxxxxxxx
xxxxxxxxxxxx000000xxxx0000000xxxxxxxxxxxxxxx
xxxxxxxxxxxx000000xxx00xxxxx00xxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxx0xxx0xx000x00xxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxx0xxx0x000000xxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxx0xxx0x00000xxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxx0xxxxx00xxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxx0xxxxx0xxxxxxxxxxxxxxxxxxxx',
    'L89 bench2 8 9 0 4 2
K99 bench 9 9 0 4 2
L711 bench2 7 11 0 2 2
K712 bench 7 12 0 2 2
L3516 bench2 35 16 0 2 2
L3716 bench2 37 16 0 4 2
K3816 bench 38 16 0 4 2
K3517 bench 35 17 0 2 2
L2718 bench2 27 18 0 4 2
K2818 bench 28 18 0 4 2
L3518 bench2 35 18 0 2 2
L2519 bench2 25 19 0 2 2
K3519 bench 35 19 0 2 2
K2520 bench 25 20 0 2 2
L2529 bench2 25 29 0 4 2
K2629 bench 26 29 0 4 2
L2330 bench2 23 30 0 2 2
K2331 bench 23 31 0 2 2',
    FALSE, 'sf', 5000, 1, 6
);

INSERT OR IGNORE INTO room_models (id, name, habbo_rooms, club_only, door_x, door_y, door_height, door_direction, heightmap, public_items, swimming_pool, special_cast, special_cast_interval_ms, special_cast_min, special_cast_max) VALUES (
    29, 'park_b', FALSE, FALSE, 11, 2, 0, 6,
    '0000x0000000
0000xx000000
000000000000
00000000000x
000000000000
00x0000x0000',
    'C00 cornerchair2 0 0 0 4 2
B10 cornerchair1 1 0 0 4 2
A20 chair1 2 0 0 4 2
A30 chair1 3 0 0 4 2
H50 table1 5 0 0 4 1
E60 chair1line 6 0 0 4 2
A70 chair1 7 0 0 4 2
F80 chair1frontend 8 0 0 4 2
J100 hububar 10 0 0 4 1
B01 cornerchair1 0 1 0 2 2
A02 chair1 0 2 0 2 2
A03 chair1 0 3 0 2 2
A04 chair1 0 4 0 2 2
F05 chair1frontend 0 5 0 2 2
I35 table2 3 5 0 4 1
D55 modchair 5 5 0 0 2
I85 table2 8 5 0 4 1',
    FALSE, 'sf', 5000, 1, 6
);

INSERT OR IGNORE INTO room_models (id, name, habbo_rooms, club_only, door_x, door_y, door_height, door_direction, heightmap, public_items, swimming_pool, special_cast, special_cast_interval_ms, special_cast_min, special_cast_max) VALUES (
    30, 'pool_b', FALSE, FALSE, 9, 21, 7, 0,
    'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx7xxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx777xxxxxxxxxxx
xxxxxxxxxxxxxxxxxx8888888x7xxx77777xxxxxxxxxx
xxxxxxxxxxxxxxxxxx8888888x7xxx777777xxxxxxxxx
xxxxxxxxxxxxxxxx88xxxxx77x7x777777777xxxxxxxx
xxxxxxxxxxxxxxxx88x7777777777777777777xxxxxxx
xxxxxxxxxxxxxxxx88x77777777777777777777xxxxxx
xxxxxxxxxxxxxx9988x77777777777777777777xxxxxx
xxxxxxxxxxxxxx9988x7777777777777777777x00xxxx
xxxxxxxxxxxxxx9988x777777777777777777x0000xxx
xxxxxxxxxxxxxx9988x7777777x0000000000000000xx
xxxxxxxxxxxxxx9988x777777x000000000000000000x
7777777777xxxx9988777777x0x0000000000000000xx
x7777777777xxx998877777x000x00000000000000xxx
xx7777777777xx99887777x00000x000000000000xxxx
xxx7777777777x9988777x0000000x0000000000xxxxx
xxxx777777777x777777x00000000x000000000xxxxxx
xxxxx777777777777777000000000x00000000xxxxxxx
xxxxxx77777777777777000000000x0000000xxxxxxxx
xxxxxxx777777x7777770000000000xxxx00xxxxxxxxx
xxxxxxxx77777777777xx0000000000000xxxxxxxxxxx
xxxxxxxxx777777110000x000000000000xxxxxxxxxxx
xxxxxxxxxx7x77x1100000x0000000000xxxxxxxxxxxx
xxxxxxxxxxx777x11000000x00000000xxxxxxxxxxxxx
xxxxxxxxxxxx771110000000x000000xxxxxxxxxxxxxx
xxxxxxxxxxxxx111100000000x0000xxxxxxxxxxxxxxx
xxxxxxxxxxxxxx11100000000x000xxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxx1100000000x00xxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxx110000000x0xxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxx110000000xxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxx1100000xxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxx11000xxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxx110xxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxx1xxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    'u332 umbrella2 33 2 7 0 1
b183 pool_2sofa2 18 3 8 4 2
B193 pool_2sofa1 19 3 8 4 2
b203 pool_2sofa2 20 3 8 4 2
B213 pool_2sofa1 21 3 8 4 2
b223 pool_2sofa2 22 3 8 4 2
B233 pool_2sofa1 23 3 8 4 2
c333 pool_chair2 33 3 7 4 2
c324 pool_chair2 32 4 7 2 2
t334 pool_table2 33 4 7 0 1
c344 pool_chair2 34 4 7 6 2
b165 pool_2sofa2 16 5 8 2 2
c335 pool_chair2 33 5 7 0 2
B166 pool_2sofa1 16 6 8 2 2
b167 pool_2sofa2 16 7 8 2 2
c357 pool_chair2 35 7 7 4 2
f148 flower1 14 8 9 0 1
B168 pool_2sofa1 16 8 8 2 2
u338 umbrella2 33 8 7 0 1
c348 pool_chair2 34 8 7 2 2
t358 pool_table2 35 8 7 0 1
c368 pool_chair2 36 8 7 6 2
b149 pool_2sofa2 14 9 9 2 2
b169 pool_2sofa2 16 9 8 2 2
c359 pool_chair2 35 9 7 0 2
B1410 pool_2sofa1 14 10 9 2 2
B1610 pool_2sofa1 16 10 8 2 2
b1411 pool_2sofa2 14 11 9 2 2
b1611 pool_2sofa2 16 11 8 2 2
B1412 pool_2sofa1 14 12 9 2 2
B1612 pool_2sofa1 16 12 8 2 2
R313 flower2b 3 13 7 2 1
r413 flower2a 4 13 7 2 1
b1413 pool_2sofa2 14 13 9 2 2
b1613 pool_2sofa2 16 13 8 2 2
B1414 pool_2sofa1 14 14 9 2 2
B1614 pool_2sofa1 16 14 8 2 2',
    TRUE, 'cam1', 4500, 1, 4
);

INSERT OR IGNORE INTO room_models (id, name, habbo_rooms, club_only, door_x, door_y, door_height, door_direction, heightmap, public_items, swimming_pool, special_cast, special_cast_interval_ms, special_cast_min, special_cast_max) VALUES (
    31, 'bb_lobby_1', FALSE, FALSE, 14, 19, 0, 0,
    'xxx2222222222222222x
xxx2222222222222222x
xxx2222222222222222x
xxx2222222222222222x
xxx11111111111111111
11x11111111111111111
11x11111111111111111
11x11111111111111111
x1x11111111111111111
xxx11111111111111111
xxx11111111111111111
xxx11111111111111111
xxx11111111111111111
xxx11111111111111111
xxxxxxxxx00000000000
xxxxxxxxx00000000000
xxxxxxxxx00000000000
xxxxxxxxx00000000000
xxxxxxxxx00000000000
xxxxxxxxx00000000000
xxxxxxxxxxxxx000xxxx
xxxxxxxxxxxxx000xxxx
xxxxxxxxxxxxx000xxxx',
    'n30 bb_crossrd 3 0 2 2 1
b40 bb_bench1 4 0 2 4 2
c50 bb_bench2 5 0 2 4 2
h80 bb_plant1 8 0 2 0 1
d90 bb_sofa1 9 0 2 4 2
e100 bb_sofa2 10 0 2 4 2
h110 bb_plant1 11 0 2 0 1
d120 bb_sofa1 12 0 2 4 2
e130 bb_sofa2 13 0 2 4 2
h140 bb_plant1 14 0 2 0 1
b160 bb_bench1 16 0 2 4 2
c170 bb_bench2 17 0 2 4 2
k180 bb_corner1out 18 0 2 0 1
b31 bb_bench1 3 1 2 2 2
o181 bb_wallend1in 18 1 2 2 1
c32 bb_bench2 3 2 2 2 2
o182 bb_wallend1in 18 2 2 2 1
j33 bb_plant3 3 3 2 0 1
t73 bb_special 7 3 2 6 1
o83 bb_wallend1in 8 3 2 6 1
o93 bb_wallend1in 9 3 2 6 1
o103 bb_wallend1in 10 3 2 6 1
o113 bb_wallend1in 11 3 2 6 1
n123 bb_crossrd 12 3 2 2 1
n163 bb_crossrd 16 3 2 0 1
o173 bb_wallend1in 17 3 2 6 1
n183 bb_crossrd 18 3 2 2 1
p34 bb_wallend2in 3 4 1 4 1
o74 bb_wallend1in 7 4 1 4 1
b84 bb_bench1 8 4 1 4 2
c94 bb_bench2 9 4 1 4 2
b104 bb_bench1 10 4 1 4 2
c114 bb_bench2 11 4 1 4 2
p124 bb_wallend2in 12 4 1 4 1
o164 bb_wallend1in 16 4 1 4 1
b174 bb_bench1 17 4 1 4 2
c184 bb_bench2 18 4 1 4 2
m194 bb_wallendout 19 4 1 4 1
a75 bb_stool 7 5 1 2 2
a125 bb_stool 12 5 1 6 2
b195 bb_bench1 19 5 1 6 2
a36 bb_stool 3 6 1 6 2
c196 bb_bench2 19 6 1 6 2
f97 bb_chair 9 7 1 4 2
f107 bb_chair 10 7 1 4 2
b177 bb_bench1 17 7 1 0 2
c187 bb_bench2 18 7 1 0 2
m197 bb_wallendout 19 7 1 0 1
a38 bb_stool 3 8 1 6 2
u178 bb_extra 17 8 1 4 1
u188 bb_extra 18 8 1 2 1
n198 bb_crossrd 19 8 1 6 1
a39 bb_stool 3 9 1 6 2
f99 bb_chair 9 9 1 0 2
f109 bb_chair 10 9 1 0 2
b179 bb_bench1 17 9 1 4 2
c189 bb_bench2 18 9 1 4 2
m199 bb_wallendout 19 9 1 4 1
b1910 bb_bench1 19 10 1 6 2
a711 bb_stool 7 11 1 2 2
a1211 bb_stool 12 11 1 6 2
c1911 bb_bench2 19 11 1 6 2
o712 bb_wallend1in 7 12 1 0 1
b812 bb_bench1 8 12 1 0 2
c912 bb_bench2 9 12 1 0 2
b1012 bb_bench1 10 12 1 0 2
c1112 bb_bench2 11 12 1 0 2
p1212 bb_wallend2in 12 12 1 0 1
b1712 bb_bench1 17 12 1 0 2
c1812 bb_bench2 18 12 1 0 2
m1912 bb_wallendout 19 12 1 0 1
k713 bb_corner1out 7 13 1 4 1
l813 bb_wallout 8 13 1 6 1
l913 bb_wallout 9 13 1 6 1
l1013 bb_wallout 10 13 1 6 1
l1113 bb_wallout 11 13 1 6 1
t1213 bb_special 12 13 1 2 1
m1613 bb_wallendout 16 13 1 6 1
l1713 bb_wallout 17 13 1 6 1
l1813 bb_wallout 18 13 1 6 1
k1913 bb_corner1out 19 13 1 2 1
g914 bb_plant0 9 14 0 6 1
d1014 bb_sofa1 10 14 0 4 2
e1114 bb_sofa2 11 14 0 4 2
i1214 bb_plant2 12 14 0 0 1
i1614 bb_plant2 16 14 0 6 1
d1714 bb_sofa1 17 14 0 4 2
e1814 bb_sofa2 18 14 0 4 2
g1914 bb_plant0 19 14 0 0 1
d915 bb_sofa1 9 15 0 2 2
d1915 bb_sofa1 19 15 0 6 2
e916 bb_sofa2 9 16 0 2 2
e1916 bb_sofa2 19 16 0 6 2
d917 bb_sofa1 9 17 0 2 2
d1917 bb_sofa1 19 17 0 6 2
e918 bb_sofa2 9 18 0 2 2
e1918 bb_sofa2 19 18 0 6 2
g919 bb_plant0 9 19 0 4 1
d1019 bb_sofa1 10 19 0 0 2
e1119 bb_sofa2 11 19 0 0 2
j1219 bb_plant3 12 19 0 2 1
j1619 bb_plant3 16 19 0 4 1
d1719 bb_sofa1 17 19 0 0 2
e1819 bb_sofa2 18 19 0 0 2
g1919 bb_plant0 19 19 0 2 1',
    FALSE, NULL, NULL, NULL, NULL
);

INSERT OR IGNORE INTO room_models (id, name, habbo_rooms, club_only, door_x, door_y, door_height, door_direction, heightmap, public_items, swimming_pool, special_cast, special_cast_interval_ms, special_cast_min, special_cast_max) VALUES (
    32, 'snowwar_lobby_1', FALSE, FALSE, 41, 36, 1, 0,
    'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx11111xx1xxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx11111xx1111xxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxx111111xxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxx1111111111111111xxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxx1111111111111111xxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxx1111111111111111xxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxx1111111111111111xxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxx1111111111111111xxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxx1111111111111111xxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxx1111111111111111xxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxx1111111111111111xxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxx1111111111111111xxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxx1111111111111111xxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxx1111111111111111xxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxx111111111111111xxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxx1111111111111111xxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxx1111111111111111xxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxx1111111111111111xxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxx111111111111111xxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxx1111x1111111111xxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    'a3118 sw_barrellchair 31 18 1 6 2
a3119 sw_barrellchair 31 19 1 6 2
a3020 sw_barrellchair 30 20 1 0 2
a3720 sw_barrellchair 37 20 1 0 2
a3920 sw_barrellchair 39 20 1 0 2
a4120 sw_barrellchair 41 20 1 0 2
d3024 sw_chair1 30 24 1 4 2
c3124 sw_chair2 31 24 1 4 2
c3224 sw_chair2 32 24 1 4 2
c3324 sw_chair2 33 24 1 4 2
b3424 sw_chair3 34 24 1 4 2
i3025 sw_table1 30 25 1 0 1
h3125 sw_table2 31 25 1 0 1
g3225 sw_table3 32 25 1 0 1
f3325 sw_table4 33 25 1 0 1
e3425 sw_table5 34 25 1 0 1
d3026 sw_chair1 30 26 1 0 2
c3126 sw_chair2 31 26 1 0 2
c3226 sw_chair2 32 26 1 0 2
c3326 sw_chair2 33 26 1 0 2
b3426 sw_chair3 34 26 1 0 2
d3029 sw_chair1 30 29 1 4 2
c3129 sw_chair2 31 29 1 4 2
c3229 sw_chair2 32 29 1 4 2
c3329 sw_chair2 33 29 1 4 2
b3429 sw_chair3 34 29 1 4 2
i3030 sw_table1 30 30 1 0 1
h3130 sw_table2 31 30 1 0 1
g3230 sw_table3 32 30 1 0 1
f3330 sw_table4 33 30 1 0 1
e3430 sw_table5 34 30 1 0 1
d3031 sw_chair1 30 31 1 0 2
c3131 sw_chair2 31 31 1 0 2
c3231 sw_chair2 32 31 1 0 2
c3331 sw_chair2 33 31 1 0 2
b3431 sw_chair3 34 31 1 0 2
x2732 invisichair 27 32 1 2 2
x2733 invisichair 27 33 1 2 2
x2734 invisichair 27 34 1 2 2
x2836 invisichair 28 36 1 0 2
x2936 invisichair 29 36 1 0 2
x3036 invisichair 30 36 1 0 2
x3136 invisichair 31 36 1 0 2',
    FALSE, NULL, NULL, NULL, NULL
);

INSERT OR IGNORE INTO room_models (id, name, habbo_rooms, club_only, door_x, door_y, door_height, door_direction, heightmap, public_items, swimming_pool, special_cast, special_cast_interval_ms, special_cast_min, special_cast_max) VALUES (
    33, 'cafe_gold0', FALSE, FALSE, 9, 29, 0, 0,
    'xxxxxxxxxx1111xxxxxxx
xxxxxxxxxx11111xxxxxx
xxxxxxxxxx111111xxxxx
xx111111111111111xxxx
x11111111111111111xxx
1111111111111111111xx
11111111111111111111x
111111111111111111111
111111111111111111111
1111111111111x1111111
1111111000000x1111111
1111111000000x1111111
1111111000000x1111111
1111111000000x1111111
1111111000000x1111111
1111111000000x1111111
1111111000000x1111111
1111111000000x1111111
1111111000000x1111111
1111111000000xxx00000
111111100000000000000
111111100000000000000
111111100000000000000
111111100000000xxxxx0
11111110000000xxxxxx0
11111110000000xxxxxx0
11111110000000xxxxxxx
x1111110000000xxxxxxx
xxxxxxxx0000000000xxx
xxxxxxxx000xxxxxxxxxx
xxxxxxxx000xxxxxxxxxx
xxxxxxxx000xxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxx',
    'c53 gold_chair 5 3 1 2 2
t63 gold_table_small1 6 3 1 6 1
c73 gold_chair 7 3 1 6 2
5103 gold_bardesk5 10 3 1 0 1
4113 gold_bardesk4 11 3 1 0 1
3123 gold_bardesk3 12 3 1 0 1
2133 gold_bardesk2 13 3 1 0 1
1143 gold_bardesk1 14 3 1 0 1
c54 gold_chair 5 4 1 2 2
y64 gold_table_small2 6 4 1 6 1
c74 gold_chair 7 4 1 6 2
c05 gold_chair 0 5 1 2 2
t15 gold_table_small1 1 5 1 6 1
c25 gold_chair 2 5 1 6 2
c06 gold_chair 0 6 1 2 2
y16 gold_table_small2 1 6 1 6 1
c26 gold_chair 2 6 1 6 2
c56 gold_chair 5 6 1 2 2
t66 gold_table_small1 6 6 1 6 1
c76 gold_chair 7 6 1 6 2
c57 gold_chair 5 7 1 2 2
y67 gold_table_small2 6 7 1 6 1
c77 gold_chair 7 7 1 6 2
c08 gold_chair 0 8 1 2 2
t18 gold_table_small1 1 8 1 6 1
c28 gold_chair 2 8 1 6 2
c198 gold_chair 19 8 1 4 2
c208 gold_chair 20 8 1 4 2
c09 gold_chair 0 9 1 2 2
y19 gold_table_small2 1 9 1 6 1
c29 gold_chair 2 9 1 6 2
c149 gold_chair 14 9 1 4 2
c159 gold_chair 15 9 1 4 2
t1910 gold_table_small1 19 10 1 0 1
y2010 gold_table_small2 20 10 1 0 1
t1411 gold_table_small1 14 11 1 0 1
y1511 gold_table_small2 15 11 1 0 1
p012 gold_plant 0 12 1 0 2
c112 gold_chair 1 12 1 0 2
c212 gold_chair 2 12 1 0 2
c312 gold_chair 3 12 1 0 2
c1912 gold_chair 19 12 1 0 2
c2012 gold_chair 20 12 1 0 2
p013 gold_plant 0 13 1 0 1
c113 gold_chair 1 13 1 4 2
c213 gold_chair 2 13 1 4 2
c313 gold_chair 3 13 1 4 2
c1413 gold_chair 14 13 1 0 2
c1513 gold_chair 15 13 1 0 2
c014 gold_chair 0 14 1 2 2
c1414 gold_chair 14 14 1 4 2
c1514 gold_chair 15 14 1 4 2
c015 gold_chair 0 15 1 2 2
t215 gold_table_small1 2 15 1 0 1
y315 gold_table_small2 3 15 1 0 1
c016 gold_chair 0 16 1 2 2
t1416 gold_table_small1 14 16 1 0 1
y1516 gold_table_small2 15 16 1 0 1
p017 gold_plant 0 17 1 0 1
c117 gold_chair 1 17 1 0 2
c217 gold_chair 2 17 1 0 2
c317 gold_chair 3 17 1 0 2
p018 gold_plant 0 18 1 0 1
c118 gold_chair 1 18 1 4 2
c218 gold_chair 2 18 1 4 2
c318 gold_chair 3 18 1 4 2
c1418 gold_chair 14 18 1 0 2
c1518 gold_chair 15 18 1 0 2
c019 gold_chair 0 19 1 2 2
c020 gold_chair 0 20 1 2 2
t220 gold_table_small1 2 20 1 0 1
y320 gold_table_small2 3 20 1 0 1
c021 gold_chair 0 21 1 2 2
p022 gold_plant 0 22 1 0 1
c122 gold_chair 1 22 1 0 2
c222 gold_chair 2 22 1 0 2
c322 gold_chair 3 22 1 0 2
p023 gold_plant 0 23 1 0 1
c123 gold_chair 1 23 1 4 2
c223 gold_chair 2 23 1 4 2
c323 gold_chair 3 23 1 4 2
c024 gold_chair 0 24 1 2 2
c025 gold_chair 0 25 1 2 2
t225 gold_table_small1 2 25 1 0 1
y325 gold_table_small2 3 25 1 0 1
c026 gold_chair 0 26 1 2 2
c127 gold_chair 1 27 1 0 2
c227 gold_chair 2 27 1 0 2
c327 gold_chair 3 27 1 0 2',
    TRUE, NULL, NULL, NULL, NULL
);

INSERT OR IGNORE INTO room_models (id, name, habbo_rooms, club_only, door_x, door_y, door_height, door_direction, heightmap, public_items, swimming_pool, special_cast, special_cast_interval_ms, special_cast_min, special_cast_max) VALUES (
    34, 'cafe', FALSE, FALSE, 30, 40, 0, 0,
    'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx000000xxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx0000000xxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxx00000xx00000000xxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxx000000000000000000xxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxx000000000000000000xxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxx000000000000000000xxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxx000000000000000000xxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxx00000000xxx0000000xxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxx00000000xxxx000000xxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxx00000000xxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxx0000000000000000xxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxx00000000000000000xxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxx00000000000000000xxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxx00000000000000000xxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxx00000000000000000xxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxx00000000000000000xxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx00000000xxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx0000000xxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx0000xxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx0000xxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx0000xxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    'd3221 chairup4 32 21 0 3
f3321 chairup6 33 21 0 4
f3421 chairup6 34 21 0 4
f3521 chairup6 35 21 0 4
f3621 chairup6 36 21 0 4
g3721 chairup7 37 21 0 4
b3222 chairup2 32 22 0 2
e2523 chairup5 25 23 0 4
f2623 chairup6 26 23 0 4
f2723 chairup6 27 23 0 4
f2823 chairup6 28 23 0 4
g2923 chairup7 29 23 0 4
a3223 chairup1 32 23 0 2
A2424 counter5 24 24 0 7
r2524 table2 25 24 0 7
q2624 table1 26 24 0 7
p2425 counter3 24 25 0 7
z2426 counter4 24 26 0 7
p2427 counter3 24 27 0 7
p2428 counter3 24 28 0 7
y2928 palms4 29 28 0 7
p2429 counter3 24 29 0 7
x2929 palms3 29 29 0 7
p2430 counter3 24 30 0 7
w2930 palms2 29 30 0 7
n2231 counter1 22 31 0 7
n2331 counter1 23 31 0 7
o2431 counter2 24 31 0 7
v2931 palms1 29 31 0 7
e3031 chairup5 30 31 0 4
f3131 chairup6 31 31 0 4
f3231 chairup6 32 31 0 4
f3331 chairup6 33 31 0 4
f3431 chairup6 34 31 0 4
f3531 chairup6 35 31 0 4
f3631 chairup6 36 31 0 4
j3731 chairright3 37 31 0 5
c2132 chairup3 21 32 0 2
t2232 table4 22 32 0 7
r3032 table2 30 32 0 7
q3132 table1 31 32 0 7
r3332 table2 33 32 0 7
q3432 table1 34 32 0 7
i3732 chairright2 37 32 0 6
b2133 chairup2 21 33 0 2
s2233 table3 22 33 0 7
i3733 chairright2 37 33 0 6
b2134 chairup2 21 34 0 2
t3634 table4 36 34 0 7
i3734 chairright2 37 34 0 6
b2135 chairup2 21 35 0 2
r2435 table2 24 35 0 7
q2535 table1 25 35 0 7
r2735 table2 27 35 0 7
q2835 table1 28 35 0 7
u3335 palm 33 35 0 7
s3635 table3 36 35 0 7
i3735 chairright2 37 35 0 6
m2136 chairleft3 21 36 0 1
l2236 chairleft2 22 36 0 0
l2336 chairleft2 23 36 0 0
l2436 chairleft2 24 36 0 0
l2536 chairleft2 25 36 0 0
l2636 chairleft2 26 36 0 0
l2736 chairleft2 27 36 0 0
k2836 chairleft1 28 36 0 0
i3736 chairright2 37 36 0 6
t3637 table4 36 37 0 7
i3737 chairright2 37 37 0 6
s3638 table3 36 38 0 7
h3738 chairright1 37 38 0 6',
    FALSE, NULL, NULL, NULL, NULL
);

INSERT OR IGNORE INTO room_models (id, name, habbo_rooms, club_only, door_x, door_y, door_height, door_direction, heightmap, public_items, swimming_pool, special_cast, special_cast_interval_ms, special_cast_min, special_cast_max) VALUES (
    35, 'cinema', FALSE, FALSE, 20, 27, 1, 0,
    'xxxxxxx1xx11111111xxxxxx
xxx1111111111111111xxxxx
xxx111xxxx1111111111xxxx
xxxx2xxxxxxxxxxxxxxxxxxx
xx3x3x333311xxxxxxxxxx11
xx3333333311111111111111
xx3333333311111111111111
xx3333333311111111122111
xx3333333311x22222222111
xx3333333311x22222222111
xx3333333311xxxxxxxxx111
xx3333333311111111111111
xx3333333311111111111111
xx3333333311111111111111
xx3333333311111xxxx11111
xx3333333311111xxxx11111
xx3333333311111xxxx11111
xx3333333311111xxxx11111
xx3333333311111xxxx11111
xx3333333311111xxxx11111
xx3333333311111xxxx11111
333333332111111xxxx11111
333333332111111111111111
333333332111111111111111
333333332111111111111111
xx3333332111111111111111
xxxxxxxxxxxxxxxxxxx11111
xxxxxxxxxxxxxxxxxxx11111
xxxxxxxxxxxxxxxxxxx11111',
    'C24 orange 2 4 3 0
A74 loungey_chair 7 4 3 2
V84 loungey_tablebigb 8 4 3 0
A94 loungey_chair 9 4 3 6
A25 loungey_chair 2 5 3 4
A75 loungey_chair 7 5 3 2
U85 loungey_tablebiga 8 5 3 0
A95 loungey_chair 9 5 3 6
B26 loungey_table 2 6 3 0
A27 loungey_chair 2 7 3 0
h137 theater_chair 13 7 1 0
h147 theater_chair 14 7 1 0
h157 theater_chair 15 7 1 0
h167 theater_chair 16 7 1 0
h177 theater_chair 17 7 1 0
h187 theater_chair 18 7 1 0
z217 stair 21 7 1 0
L98 lightpole 9 8 3 0
q138 pomomaski 13 8 2 2
q148 pomomaski 14 8 2 0
q158 pomomaski 15 8 2 0
q168 pomomaski 16 8 2 0
q178 pomomaski 17 8 2 0
q188 pomomaski 18 8 2 0
q198 pomomaski 19 8 2 1
z218 stair 21 8 1 0
C29 orange 2 9 3 0
h139 theater_chair 13 9 2 0
h149 theater_chair 14 9 2 0
h159 theater_chair 15 9 2 0
h169 theater_chair 16 9 2 0
h179 theater_chair 17 9 2 0
h189 theater_chair 18 9 2 0
h199 theater_chair 19 9 2 0
h209 theater_chair 20 9 2 0
z219 stair 21 9 1 0
A210 loungey_chair 2 10 3 4
A910 loungey_chair 9 10 3 4
B211 loungey_table 2 11 3 0
B911 loungey_table 9 11 3 0
A212 loungey_chair 2 12 3 0
A912 loungey_chair 9 12 3 0
d1712 cubicb_chair 17 12 1 6
c1912 cubico_chair 19 12 1 2
d1513 cubicb_chair 15 13 1 2
L1913 lightpole 19 13 1 0
d2013 cubicb_chair 20 13 1 6
L914 lightpole 9 14 3 0
A215 loungey_chair 2 15 3 4
d1415 cubicb_chair 14 15 1 4
c1915 cubico_chair 19 15 1 4
B216 loungey_table 2 16 3 0
A716 loungey_chair 7 16 3 2
B816 loungey_table 8 16 3 2
A916 loungey_chair 9 16 3 6
d1316 cubicb_chair 13 16 1 2
d1416 cubicb_chair 14 16 1 6
C1916 orange 19 16 1 0
A217 loungey_chair 2 17 3 0
A717 loungey_chair 7 17 3 2
B817 loungey_table 8 17 3 2
A917 loungey_chair 9 17 3 6
d1917 cubicb_chair 19 17 1 2
C218 orange 2 18 3 0
d1418 cubicb_chair 14 18 1 4
K219 bardesque 2 19 3 0
K220 bardesque 2 20 3 1
b320 bar_chair 3 20 3 6
L920 lightpole 9 20 3 0
d1420 cubicb_chair 14 20 1 0
d1920 cubicb_chair 19 20 1 2
c2020 cubico_chair 20 20 1 6
K221 bardesque 2 21 3 1
b321 bar_chair 3 21 3 6
d1921 cubicb_chair 19 21 1 0
K222 bardesque 2 22 3 1
b322 bar_chair 3 22 3 6
L1622 lightpole 16 22 1 0
c1822 cubico_chair 18 22 1 0
K223 bardesque 2 23 3 1
b323 bar_chair 3 23 3 6
K224 bardesque 2 24 3 1
b324 bar_chair 3 24 3 6
K225 bardesque 2 25 3 2',
    FALSE, NULL, NULL, NULL, NULL
);

INSERT OR IGNORE INTO room_models (id, name, habbo_rooms, club_only, door_x, door_y, door_height, door_direction, heightmap, public_items, swimming_pool, special_cast, special_cast_interval_ms, special_cast_min, special_cast_max) VALUES (
    36, 'den', FALSE, FALSE, 3, 22, 0, 0,
    '00000000xxxxxxxx
0000000000000000
0000000000000000
000000000000xx00
0000000000000000
0000000000000000
0000000000000000
x000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
x000000000000000
x000000000000000
x000000000000000
x000000000000000
x000000000000000
x000000000000000
x000000000000000
x000000000000000
xxx00xxxxxxxxxxx
xxx00xxxxxxxxxxx
xxx00xxxxxxxxxxx',
    'l70 crs_lamptable 7 0 0 0
g141 tvtable 14 1 0 2
t02 crs_trash 0 2 0 0
s22 crs_sofag_start 2 2 0 4
m32 crs_sofag_mid 3 2 0 4
m42 crs_sofag_mid 4 2 0 4
S52 crs_sofag_end 5 2 0 4
R124 crs_roundwoodtable 12 4 0 2 2
W154 crs_woodchair 15 4 0 6
W105 crs_woodchair 10 5 0 2
W156 crs_woodchair 15 6 0 6
W77 crs_woodchair 7 7 0 4
W138 crs_woodchair 13 8 0 4
W158 crs_woodchair 15 8 0 4
W59 crs_woodchair 5 9 0 2
F010 crs_fridge 0 10 0 0
V710 ctable2 7 10 0 2
Y1310 crs_woodtable_end 13 10 0 1 2
y1410 crs_woodtable_start 14 10 0 2 2
W511 crs_woodchair 5 11 0 2
B112 crs_box 1 12 0 2
B113 crs_box 1 13 0 2
v713 ctable1 7 13 0 2
W1313 crs_woodchair 13 13 0 0
W1513 crs_woodchair 15 13 0 0
B115 crs_box 1 15 0 2
P117 crs_boxopen 1 17 0 2
i1517 crs_stomp 15 17 0 0
B118 crs_box 1 18 0 2
i1518 crs_stomp 15 18 0 0
b119 crs_boxtwo 1 19 0 2',
    FALSE, NULL, NULL, NULL, NULL
);

INSERT OR IGNORE INTO room_models (id, name, habbo_rooms, club_only, door_x, door_y, door_height, door_direction, heightmap, public_items, swimming_pool, special_cast, special_cast_interval_ms, special_cast_min, special_cast_max) VALUES (
    37, 'gardens', FALSE, FALSE, 2, 15, 0, 0,
    'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx0xxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx00xxxxxxxxxxxx
xxxxxxxxxxxxx0x00xxxxxxxxxxx0x000xxxxxxxxxxx
xxxxxxxxxxxx0000000000000000000000xxxxxxxxxx
xxxxxxxxxxx000000000000000000000000xxxxxxxxx
xxxxxxxxxxx0000000000000000000000000xxxxxxxx
xxxxxxxxxxx00000000000000000000000000xxxxxxx
xxxxxxxx000000000000000000000000000000xxxxxx
xxxxxxx00000000000000000000000000000000xxxxx
xxxxxxx000000000000000000000000000000000xxxx
xxxxxxx0000000000000000000000000000000000xxx
xxxxxxxxx000000000000000000000000000000000xx
00000000000000000000xx00000000000000000000xx
0000000000000000000xxxx00000000000xxxxxxx0xx
0000000000000000000xxxx00000000000x00000xxxx
xxxxx00x0000000000xxxxx0xxxxxx0000x0000000xx
xxxxx0000000000000xxxxx0xx000x0000x000000xxx
xxxxx0000000000000xxxxx0x000000000x00000xxxx
xxxxx000000x0000000xxxx0x000000000xxx00xxxxx
xxxxxxxx000x0000000xxx00xxx000000x0000xxxxxx
xxxxxxxx000x000000xxxx0x0000000000000xxxxxxx
xxxxxxxx000x000000011100000000000000xxxxxxxx
xxxxxxxx000x00000001110000000000000xxxxxxxxx
xxxxxxxxx00x0000000111x00000000x00xxxxxxxxxx
xxxxxxxxxx0x0000000xxx0000000xxxxxxxxxxxxxxx
xxxxxxxxxxxx000000xxxx0000000xxxxxxxxxxxxxxx
xxxxxxxxxxxx000000xxx00xxxxx00xxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxx0xxx0xx000x00xxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxx0xxx0x000000xxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxx0xxx0x00000xxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxx0xxxxx00xxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxx0xxxxx0xxxxxxxxxxxxxxxxxxxx',
    'L89 bench2 8 9 0 4
K99 bench 9 9 0 4
L711 bench2 7 11 0 2
K712 bench 7 12 0 2
L3516 bench2 35 16 0 2
L3716 bench2 37 16 0 4
K3816 bench 38 16 0 4
K3517 bench 35 17 0 2
L2718 bench2 27 18 0 4
K2818 bench 28 18 0 4
L3518 bench2 35 18 0 2
L2519 bench2 25 19 0 2
K3519 bench 35 19 0 2
K2520 bench 25 20 0 2
L2529 bench2 25 29 0 4
K2629 bench 26 29 0 4
L2330 bench2 23 30 0 2
K2331 bench 23 31 0 2',
    FALSE, NULL, NULL, NULL, NULL
);

INSERT OR IGNORE INTO room_models (id, name, habbo_rooms, club_only, door_x, door_y, door_height, door_direction, heightmap, public_items, swimming_pool, special_cast, special_cast_interval_ms, special_cast_min, special_cast_max) VALUES (
    38, 'square_1', FALSE, FALSE, 17, 26, 0, 0,
    'xxxxxxxxx222xx222222xxx222xxxxxx
xxxxxxxxx222xx2222222xx222xxxxxx
xxxxxxxxx22222222222222222xxxxxx
xxxxxxxxx22222222222222222xxxxxx
xxxxxxxxx22222222222222222xxxxxx
xxxxxxxxx22222x22222x22222xxxxxx
xxxxxxxxx11111x22222x11111xxxxxx
0000000xx00000x22222x00000xxxxxx
0000000xx00000000000000000xxxxxx
000000000000000000000000000xx00x
000000000000xxx00000xxx00000000x
000000000000xxx00000xxx00000000x
000000000000xxx00000xxx000000000
00000000000000000000000000000000
x0000000000000000000000000000000
xxx00000000000000000000000000000
xxxxx000000000000000000000000000
xxxxx000000000000000000000000000
xxxxx000000000000000000000000xxx
xxxxxx00000000000000000000000xxx
xxxxxxx000000000000000000000xxxx
xxxxxxxxxx00000000000000000xxxxx
xxxxxxxxxx0000000000000000xxxxxx
xxxxxxxxxx000000000000000xxxxxxx
xxxxxxxxxxxxx00000000000xxxxxxxx
xxxxxxxxxxxxxx000000000xxxxxxxxx
xxxxxxxxxxxxxxxx000xxxxxxxxxxxxx
xxxxxxxxxxxxxxxx000xxxxxxxxxxxxx
xxxxxxxxxxxxxxxx000xxxxxxxxxxxxx',
    'd155 gate_table1 15 5 2 2
d195 gate_table1 19 5 2 6
e156 gate_table2 15 6 2 2
e196 gate_table2 19 6 2 6
d27 gate_table1 2 7 0 4
e37 gate_table2 3 7 0 4
f47 gate_table3 4 7 0 4
f157 gate_table3 15 7 2 2
f197 gate_table3 19 7 2 6
d210 gate_table1 2 10 0 0
e310 gate_table2 3 10 0 0
f410 gate_table3 4 10 0 0
d211 gate_table1 2 11 0 4
e311 gate_table2 3 11 0 4
f411 gate_table3 4 11 0 4
b2913 gate_drumchair 29 13 0 4
b3013 gate_drumchair 30 13 0 4
d214 gate_table1 2 14 0 0
e314 gate_table2 3 14 0 0
f414 gate_table3 4 14 0 0
b1214 gate_drumchair 12 14 0 4
b1714 gate_drumchair 17 14 0 4
b2214 gate_drumchair 22 14 0 4
h815 gate_lantern 8 15 0 0
b1115 gate_drumchair 11 15 0 2
c1215 gate_table 12 15 0 0
b1315 gate_drumchair 13 15 0 6
b1615 gate_drumchair 16 15 0 2
c1715 gate_table 17 15 0 0
b1815 gate_drumchair 18 15 0 6
b2115 gate_drumchair 21 15 0 2
c2215 gate_table 22 15 0 0
b2315 gate_drumchair 23 15 0 6
h2615 gate_lantern 26 15 0 0
b1216 gate_drumchair 12 16 0 0
b1716 gate_drumchair 17 16 0 0
b2216 gate_drumchair 22 16 0 0
b2917 gate_drumchair 29 17 0 0
b3017 gate_drumchair 30 17 0 0
i1018 gate_rockchair1 10 18 0 2
i1418 gate_rockchair1 14 18 0 6
a2018 gate_trashcan 20 18 0 0
k2118 gate_rockchair3 21 18 0 4
j2218 gate_rockchair2 22 18 0 4
i2318 gate_rockchair1 23 18 0 4
j1019 gate_rockchair2 10 19 0 2
k1419 gate_rockchair3 14 19 0 6
j2019 gate_rockchair2 20 19 0 2
k1020 gate_rockchair3 10 20 0 2
j1420 gate_rockchair2 14 20 0 6
k2020 gate_rockchair3 20 20 0 2
i1021 gate_rockchair1 10 21 0 2
i2021 gate_rockchair1 20 21 0 2
g1022 gate_talltree 10 22 0 0
g1023 gate_talltree 10 23 0 0',
    FALSE, NULL, NULL, NULL, NULL
);

INSERT OR IGNORE INTO room_models (id, name, habbo_rooms, club_only, door_x, door_y, door_height, door_direction, heightmap, public_items, swimming_pool, special_cast, special_cast_interval_ms, special_cast_min, special_cast_max) VALUES (
    39, 'square_2', FALSE, FALSE, 17, 23, 0, 0,
    'xxxxxxxxxxx111111111111xxxxxxxxxxxx
xxxxxxxxxx11111111111111xxxxxxxxxxx
xxxxxxxxxx11111111111111xxxxxxxxxxx
xxxxxxxxxx11xxxx11xxxx11xxxxxxxxxxx
xxxxxxxxxx00xxxx00xxxx00xxxxxxxxxxx
xxxxxxx0000000000000000000xxxxxxxxx
xxxxxx000000000000000000000xxxxxxxx
xxxxx0000000000000000000x000xxxxxxx
xxxx00000000000000000000xx000xxxxxx
xxxx00000000000000000000xxx000xxxxx
xxxx00000000000000000000xxxx00xxxxx
000000000000000000000000000000xxxxx
0000000000000000000000000000000xxxx
000000000000000000000000000000xxxxx
000000000000000000000000000000xxxxx
000000000000000000000000000000xxxxx
xx00000000000000000000000000000000x
xxx000xxxx00000000000000xxxx0000000
xxx0000xxx00000000000000xxx00000000
xxxx0000xx00000000000000xx000000000
xxxxx0000x00000000000000x00000000xx
xxxxxx00000000000000000000000xxxxxx
xxxxxxx00000x000000000000000x0xxxxx
xxxxxxxx0000xxx0000xxx000000xxxxxxx
xxxxxxxxx000xxx0000xxx000000xxxxxxx
xxxxxxxxxxxxxxx0000xxx000000xxxxxxx
xxxxxxxxxxxxxxxx000xxx000000xxxxxxx
xxxxxxxxxxxxxxxxxxxxxx00000xxxxxxxx',
    'd120 gate_table1 12 0 1 4
e130 gate_table2 13 0 1 4
f140 gate_table3 14 0 1 4
d160 gate_table1 16 0 1 4
f170 gate_table3 17 0 1 4
d190 gate_table1 19 0 1 4
e200 gate_table2 20 0 1 4
f210 gate_table3 21 0 1 4
g97 gate_talltree 9 7 0 0
b148 gate_drumchair 14 8 0 4
b198 gate_drumchair 19 8 0 4
g99 gate_talltree 9 9 0 0
b139 gate_drumchair 13 9 0 2
c149 gate_table 14 9 0 0
b159 gate_drumchair 15 9 0 6
b189 gate_drumchair 18 9 0 2
c199 gate_table 19 9 0 0
b209 gate_drumchair 20 9 0 6
g610 gate_talltree 6 10 0 0
g810 gate_talltree 8 10 0 0
b1410 gate_drumchair 14 10 0 0
b1910 gate_drumchair 19 10 0 0
k611 gate_rockchair3 6 11 0 2
j811 gate_rockchair2 8 11 0 6
b112 gate_drumchair 1 12 0 4
b212 gate_drumchair 2 12 0 4
i612 gate_rockchair1 6 12 0 2
g2712 gate_talltree 27 12 0 0
g3012 gate_talltree 30 12 0 0
b114 gate_drumchair 1 14 0 0
b214 gate_drumchair 2 14 0 0
i615 gate_rockchair1 6 15 0 2
a2715 gate_trashcan 27 15 0 0
j616 gate_rockchair2 6 16 0 2
k816 gate_rockchair3 8 16 0 6
d3116 gate_table1 31 16 0 4
f3216 gate_table3 32 16 0 4
b1417 gate_drumchair 14 17 0 4
b1917 gate_drumchair 19 17 0 4
b1318 gate_drumchair 13 18 0 2
c1418 gate_table 14 18 0 0
b1518 gate_drumchair 15 18 0 6
b1818 gate_drumchair 18 18 0 2
c1918 gate_table 19 18 0 0
b2018 gate_drumchair 20 18 0 6
b1419 gate_drumchair 14 19 0 0
b1919 gate_drumchair 19 19 0 0
d3119 gate_table1 31 19 0 0
f3219 gate_table3 32 19 0 0
h2922 gate_lantern 29 22 0 0
a823 gate_trashcan 8 23 0 0
d2324 gate_table1 23 24 0 2
d2624 gate_table1 26 24 0 6
f2325 gate_table3 23 25 0 2
f2625 gate_table3 26 25 0 6',
    FALSE, NULL, NULL, NULL, NULL
);

INSERT OR IGNORE INTO room_models (id, name, habbo_rooms, club_only, door_x, door_y, door_height, door_direction, heightmap, public_items, swimming_pool, special_cast, special_cast_interval_ms, special_cast_min, special_cast_max) VALUES (
    40, 'rumble', FALSE, FALSE, 1, 5, 7, 0,
    'xxxxxxxx77xxxxxxxxxxxxxxxx
xxxxxxxx77xxxxxxxxxxxxxxxx
xxxxxx77777x77xxxxxxxxxxxx
xxx77777777777xxx44xxxxxxx
77777777777777xx444444444x
777777777777777xx44444444x
xxx777777777777xx44444444x
xxxx7777777777xxx44444444x
7777777777777777744448444x
7777777777777x4x744448444x
777777777777x444444448444x
7777777777774444444448444x
7777777777774444444448444x
777777777777x444444448444x
7777777777777x44444448444x
xxx777777777777x444448444x
xxx7777777777777444448444x
xxx7777777777777444448444x
xxx777777777777x444448444x
xxx77777777777x4444444444x
xxxx777777777444444444444x
xxxxxxxxxxxxxxxxxxxxxxxxxx',
    'A43 mntdwchair 4 3 7 4
A53 mntdwchair 5 3 7 4
M28 barmask 2 8 7 0
s78 mntdwsofa2 7 8 7 2
t88 mntdwtable2 8 8 7 0
s98 mntdwsofa2 9 8 7 6
y218 paalu5 21 8 8 0
M29 barmask 2 9 7 0
S79 mntdwsofa1 7 9 7 2
T89 mntdwtable1 8 9 7 0
S99 mntdwsofa1 9 9 7 6
y219 paalu5 21 9 8 0
M210 barmask 2 10 7 0
y2110 paalu5 21 10 8 0
M211 barmask 2 11 7 0
y2111 paalu5 21 11 8 0
M212 barmask 2 12 7 0
s712 mntdwsofa2 7 12 7 4
S812 mntdwsofa1 8 12 7 4
e2112 paalu3 21 12 8 0
M213 barmask 2 13 7 0
t713 mntdwtable2 7 13 7 2
T813 mntdwtable1 8 13 7 2
e2113 paalu3 21 13 8 0
M214 barmask 2 14 7 0
s714 mntdwsofa2 7 14 7 0
S814 mntdwsofa1 8 14 7 0
e2114 paalu3 21 14 8 0
M215 barmask 2 15 100000 0
q2115 paalu1 21 15 8 0
M216 barmask 2 16 100000 0
s1216 mntdwsofa2 12 16 7 4
S1316 mntdwsofa1 13 16 7 4
q2116 paalu1 21 16 8 0
A317 mntdwchair 3 17 7 2
s617 mntdwsofa2 6 17 7 2
t717 mntdwtable2 7 17 7 0
s817 mntdwsofa2 8 17 7 6
t1217 mntdwtable2 12 17 7 2
T1317 mntdwtable1 13 17 7 2
q2117 paalu1 21 17 8 0
A318 mntdwchair 3 18 7 2
S618 mntdwsofa1 6 18 7 2
T718 mntdwtable1 7 18 7 0
S818 mntdwsofa1 8 18 7 6
s1218 mntdwsofa2 12 18 7 0
S1318 mntdwsofa1 13 18 7 0
q2118 paalu1 21 18 8 0',
    FALSE, NULL, NULL, NULL, NULL
);

INSERT OR IGNORE INTO room_models (id, name, habbo_rooms, club_only, door_x, door_y, door_height, door_direction, heightmap, public_items, swimming_pool, special_cast, special_cast_interval_ms, special_cast_min, special_cast_max) VALUES (
    41, 'terace', FALSE, FALSE, 9, 17, 0, 0,
    'xxxxxx21000000000xxxxxxxx
xxxxxx3xxx000xx000xxxxxxx
xxxxxx4xxx000xxx000xxxxxx
xxxxxx44xx000x00x000xxxxx
xxxxxx44xx0000xx00000xxxx
xxxxxx44xx000000000000xxx
xxxxxx44xx0000000000000xx
xxxxxxx4xxxxxxx00000000xx
xxxxxxx4xxxxxxx0000000xxx
xxxxxx444432222xxx00xxxxx
xxxxxx444432222x0000000xx
xxxxxx444432222x0000000xx
xxxxxx44400x222x0000000xx
xxxxxx444000x11x0000000xx
xxxxxx444000000x0000000xx
xxxxxx444000000x0000000xx
xxxxxx440000000000000000x
xxxxxx4400000000000000000
x8876x444000000x000000000
x8xx6x444000000x000000000
x9xx6x444000000x000000000
999x65444000000x000000000
999xxx444xxxxxxxxxx000000
999xxx444xxxxxxxxxxx00000
999xxx333xxxxxxxxxxxx0000
999xxx222222222222222x000
xxxxxx222222222222222xx00
xxxxxx222222222222222xxx0
xxxxxx222222222222222xxxx
xxxxxxx22222222222222xxxx
xxxxxxxx2222222222222xxxx',
    'a1611 sun_chair 16 11 0 2
a2011 sun_chair 20 11 0 2
a1612 sun_chair 16 12 0 2
a2012 sun_chair 20 12 0 2
b1013 blusun_chair 10 13 0 4
a1613 sun_chair 16 13 0 2
a2013 sun_chair 20 13 0 2
c1014 sun_table 10 14 0 0
a2014 sun_chair 20 14 0 2
b1015 blusun_chair 10 15 0 0
a118 sun_chair 1 18 8 2
a418 sun_chair 4 18 6 2
b1118 blusun_chair 11 18 0 4
b1019 blusun_chair 10 19 0 2
c1119 sun_table 11 19 0 0
b1219 blusun_chair 12 19 0 6
a1819 sun_chair 18 19 0 2
a2219 sun_chair 22 19 0 2
b1120 blusun_chair 11 20 0 0
a1820 sun_chair 18 20 0 2
a2220 sun_chair 22 20 0 2
a421 sun_chair 4 21 6 2
a621 sun_chair 6 21 4 2
a1821 sun_chair 18 21 0 2
a2221 sun_chair 22 21 0 2
b222 blusun_chair 2 22 9 4
a2222 sun_chair 22 22 0 2
b123 blusun_chair 1 23 9 2
d223 sun_table2 2 23 9 0
b224 blusun_chair 2 24 9 0
a1125 sun_chair 11 25 2 4
a1225 sun_chair 12 25 2 4
a1325 sun_chair 13 25 2 4
c1425 sun_table 14 25 2 0
a1525 sun_chair 15 25 2 4
a1625 sun_chair 16 25 2 4
a1725 sun_chair 17 25 2 4
a1329 sun_chair 13 29 2 2
a1529 sun_chair 15 29 2 2
a1729 sun_chair 17 29 2 2
a1330 sun_chair 13 30 2 2
a1530 sun_chair 15 30 2 2
a1730 sun_chair 17 30 2 2',
    FALSE, NULL, NULL, NULL, NULL
);

INSERT OR IGNORE INTO room_models (id, name, habbo_rooms, club_only, door_x, door_y, door_height, door_direction, heightmap, public_items, swimming_pool, special_cast, special_cast_interval_ms, special_cast_min, special_cast_max) VALUES (
    42, 's', FALSE, FALSE, 0, 3, 0, 2,
    'xxxxxxxxx
000000xx
000000xx
0000A0xx
000000xx
000000xx
000A00xx
000000xx
xxxxxxxx',
    '',
    TRUE, NULL, NULL, NULL, NULL
);

INSERT OR IGNORE INTO public_rooms (id, room_category_id, room_model_id, name, unit, casts, max_visitors) VALUES
    (101, 3, 19, 'Welcome Lounge', 'welcome_lounge', 'hh_room_nlobby', 35),
    (102, 5, 24, 'Pool - A', 'habbo_lido', 'hh_room_pool,hh_people_pool', 25),
    (103, 7, 20, 'Holoween theatre', 'theatredrome_halloween', 'hh_room_theater_halloween', 40),
    (104, 7, 21, 'The Library', 'library', 'hh_room_library_twr_trr', 20),
    (105, 9, 23, 'The Sunset Cafe', 'sunset_cafe', 'hh_room_sunsetcafe', 20),
    (106, 9, 25, 'The Pub', 'the_dirty_duck_pub', 'hh_room_pub', 35),
    (107, 5, 30, 'Pool - B', 'habbo_lido_ii', 'hh_room_pool,hh_people_pool', 25),
    (108, 5, 22, 'Floatinggarden', 'floatinggarden', 'hh_room_floatinggarden', 30),
    (109, 5, 26, 'Rooftop Rumble', 'rooftop_rumble', 'hh_room_terrace,hh_paalu,hh_people_pool,hh_people_paalu', 25),
    (110, 5, 27, 'Picnic Fields', 'picnic', 'hh_room_picnic', 25),
    (111, 8, 28, 'The Park', 'park', 'hh_room_park_general,hh_room_park', 30),
    (112, 8, 29, 'The Infobus', 'park', 'hh_room_park_general,hh_room_park', 15);
