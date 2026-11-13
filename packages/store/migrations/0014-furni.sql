-- The furni habbos own, each piece in a hand, in a room or in its user's shared inventory.
-- decision holo-port/0057 and decision server/0096.

-- A piece of furni, which belongs to a user. The habbo that holds it has it in its hand. A placed one stands in a room:
-- a floor furni on the tile x, y at an altitude, turned to a direction, and a wall item at wall_position, as the
-- client writes it. One that no habbo holds and no room has is in its user's shared inventory. state is what the
-- client calls its stuff data or its item data, such as a dice's number.
CREATE TABLE IF NOT EXISTS furni (
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
    CHECK (avatar_id IS NULL OR room_id IS NULL)
);

CREATE INDEX IF NOT EXISTS idx_furni_user_id ON furni (user_id);
CREATE INDEX IF NOT EXISTS idx_furni_avatar_id ON furni (avatar_id);
CREATE INDEX IF NOT EXISTS idx_furni_room_id ON furni (room_id);
