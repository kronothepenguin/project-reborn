-- What a room keeps between visits: rights, bans, votes and the chat history, and the habbos' ignore lists
-- (decision server/0011). The rooms themselves are navigator.schema.sql's.

-- A habbo with rights in a room: it moves the room's furni and answers its doorbell.
CREATE TABLE IF NOT EXISTS room_rights (
    room_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    avatar_id INTEGER NOT NULL REFERENCES avatars(id) ON DELETE CASCADE,
    granted_at DATETIME NOT NULL,
    PRIMARY KEY (room_id, avatar_id)
);

CREATE INDEX IF NOT EXISTS idx_room_rights_avatar_id ON room_rights (avatar_id);

-- A habbo kept out of a room until expires_at.
CREATE TABLE IF NOT EXISTS room_bans (
    room_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    avatar_id INTEGER NOT NULL REFERENCES avatars(id) ON DELETE CASCADE,
    expires_at DATETIME NOT NULL,
    PRIMARY KEY (room_id, avatar_id)
);

CREATE INDEX IF NOT EXISTS idx_room_bans_avatar_id ON room_bans (avatar_id);

-- A habbo's vote on a room, once: RATEFLAT's 1 or -1.
CREATE TABLE IF NOT EXISTS room_votes (
    room_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    avatar_id INTEGER NOT NULL REFERENCES avatars(id) ON DELETE CASCADE,
    vote INTEGER NOT NULL CHECK (vote IN (-1, 1)),
    voted_at DATETIME NOT NULL,
    PRIMARY KEY (room_id, avatar_id)
);

CREATE INDEX IF NOT EXISTS idx_room_votes_avatar_id ON room_votes (avatar_id);

-- A line said in a public room or a habbo room, kept for moderators. A deleted habbo room leaves its lines without a
-- room, so that deleting a room never erases what was said in it.
CREATE TABLE IF NOT EXISTS chat_messages (
    id INTEGER PRIMARY KEY,
    public_room_id INTEGER REFERENCES public_rooms(id) ON DELETE SET NULL,
    room_id INTEGER REFERENCES rooms(id) ON DELETE SET NULL,
    avatar_id INTEGER NOT NULL REFERENCES avatars(id) ON DELETE CASCADE,
    kind TEXT NOT NULL CHECK (kind IN ('chat', 'whisper', 'shout')),
    to_avatar_id INTEGER REFERENCES avatars(id) ON DELETE SET NULL,
    text TEXT NOT NULL,
    said_at DATETIME NOT NULL,
    CHECK (public_room_id IS NULL OR room_id IS NULL)
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_public_room_id_said_at ON chat_messages (public_room_id, said_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id_said_at ON chat_messages (room_id, said_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_avatar_id_said_at ON chat_messages (avatar_id, said_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_to_avatar_id ON chat_messages (to_avatar_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_said_at ON chat_messages (said_at);

-- A habbo whose chat another habbo does not want to see.
CREATE TABLE IF NOT EXISTS ignored_habbos (
    avatar_id INTEGER NOT NULL REFERENCES avatars(id) ON DELETE CASCADE,
    ignored_avatar_id INTEGER NOT NULL REFERENCES avatars(id) ON DELETE CASCADE,
    created_at DATETIME NOT NULL,
    PRIMARY KEY (avatar_id, ignored_avatar_id)
);

CREATE INDEX IF NOT EXISTS idx_ignored_habbos_ignored_avatar_id ON ignored_habbos (ignored_avatar_id);
