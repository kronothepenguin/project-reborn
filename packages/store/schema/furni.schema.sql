-- The furni habbos own (plans/holo-port decision 0057, plans/server decision 0096).

-- A piece of furni, which belongs to a user. The habbo that holds it has it in its hand. A placed one stands in a room:
-- a floor furni on the tile x, y at an altitude, turned to a direction, and a wall item at wall_position, as the
-- client writes it. One that waits inside a present has that box as box_furni_id. One that no habbo holds, no room
-- has and no box holds is in its user's shared inventory. state is what the client calls its stuff data or its item
-- data, such as a dice's number, or the note of a present after an exclamation mark.
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
    box_furni_id INTEGER REFERENCES furni(id) ON DELETE SET NULL,
    CHECK (avatar_id IS NULL OR room_id IS NULL)
);

CREATE INDEX IF NOT EXISTS idx_furni_user_id ON furni (user_id);
CREATE INDEX IF NOT EXISTS idx_furni_avatar_id ON furni (avatar_id);
CREATE INDEX IF NOT EXISTS idx_furni_room_id ON furni (room_id);
CREATE INDEX IF NOT EXISTS idx_furni_box_furni_id ON furni (box_furni_id);

-- What a habbo wrote on a post-it that hangs on a wall. A post-it nobody wrote on has no row. The post-it's colour
-- is its furni's state.
CREATE TABLE IF NOT EXISTS furni_notes (
    furni_id INTEGER PRIMARY KEY REFERENCES furni(id) ON DELETE CASCADE,
    text TEXT NOT NULL
);
