CREATE TABLE IF NOT EXISTS avatars (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL COLLATE NOCASE,
    figure TEXT NOT NULL,
    gender TEXT NOT NULL CHECK (gender IN ('M', 'F')),
    motto TEXT NOT NULL DEFAULT '',
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_avatars_name ON avatars(name);

CREATE INDEX IF NOT EXISTS idx_avatars_user_id ON avatars(user_id);

CREATE TABLE IF NOT EXISTS avatar_badges (
    avatar_id INTEGER NOT NULL REFERENCES avatars(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    worn BOOLEAN NOT NULL DEFAULT FALSE,
    granted_at DATETIME NOT NULL,
    PRIMARY KEY (avatar_id, code)
);

-- A habbo wears at most one badge.
CREATE UNIQUE INDEX IF NOT EXISTS idx_avatar_badges_avatar_id_worn ON avatar_badges(avatar_id) WHERE worn;

CREATE TABLE IF NOT EXISTS wardrobe_outfits (
    avatar_id INTEGER NOT NULL REFERENCES avatars(id) ON DELETE CASCADE,
    slot INTEGER NOT NULL CHECK (slot >= 1),
    figure TEXT NOT NULL,
    gender TEXT NOT NULL CHECK (gender IN ('M', 'F')),
    updated_at DATETIME NOT NULL,
    PRIMARY KEY (avatar_id, slot)
);
