CREATE TABLE IF NOT EXISTS avatars (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL COLLATE NOCASE,
    figure TEXT NOT NULL,
    gender TEXT NOT NULL CHECK (gender IN ('M', 'F')),
    motto TEXT NOT NULL DEFAULT '',
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    archived_at DATETIME
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_avatars_name ON avatars(name);

CREATE INDEX IF NOT EXISTS idx_avatars_user_id ON avatars(user_id);

-- slot is where the habbo wears the badge, 1 to 5 as the R26 client's badge window sets them, or 0 when it does not
-- wear it (decision server/0083).
CREATE TABLE IF NOT EXISTS avatar_badges (
    avatar_id INTEGER NOT NULL REFERENCES avatars(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    slot INTEGER NOT NULL DEFAULT 0 CHECK (slot BETWEEN 0 AND 5),
    granted_at DATETIME NOT NULL,
    PRIMARY KEY (avatar_id, code)
);

-- A habbo wears one badge at most in each slot.
CREATE UNIQUE INDEX IF NOT EXISTS idx_avatar_badges_avatar_id_slot ON avatar_badges(avatar_id, slot) WHERE slot > 0;

CREATE TABLE IF NOT EXISTS wardrobe_outfits (
    avatar_id INTEGER NOT NULL REFERENCES avatars(id) ON DELETE CASCADE,
    slot INTEGER NOT NULL CHECK (slot >= 1),
    figure TEXT NOT NULL,
    gender TEXT NOT NULL CHECK (gender IN ('M', 'F')),
    updated_at DATETIME NOT NULL,
    PRIMARY KEY (avatar_id, slot)
);

-- What the game server saves of a habbo; a habbo that never logged in to the game has no row.
CREATE TABLE IF NOT EXISTS avatar_game_data (
    avatar_id INTEGER PRIMARY KEY REFERENCES avatars(id) ON DELETE CASCADE,
    last_online_at DATETIME,
    machine_id TEXT,
    sound_enabled BOOLEAN NOT NULL DEFAULT TRUE
);
