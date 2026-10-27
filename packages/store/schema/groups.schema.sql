-- The owner (avatar_id) also has an admin row in group_members, written in the
-- same transaction as the group.
CREATE TABLE IF NOT EXISTS groups (
    id INTEGER PRIMARY KEY,
    avatar_id INTEGER NOT NULL REFERENCES avatars(id) ON DELETE CASCADE,
    name TEXT NOT NULL COLLATE NOCASE,
    description TEXT NOT NULL DEFAULT '',
    badge TEXT NOT NULL,
    access TEXT NOT NULL DEFAULT 'open',
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_groups_name ON groups(name);

CREATE INDEX IF NOT EXISTS idx_groups_avatar_id ON groups(avatar_id);

-- joined_at is NULL while a membership request is pending.
CREATE TABLE IF NOT EXISTS group_members (
    group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    avatar_id INTEGER NOT NULL REFERENCES avatars(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member',
    favourite BOOLEAN NOT NULL DEFAULT FALSE,
    requested_at DATETIME NOT NULL,
    joined_at DATETIME,
    PRIMARY KEY (group_id, avatar_id)
);

CREATE INDEX IF NOT EXISTS idx_group_members_avatar_id ON group_members(avatar_id);

-- A habbo has at most one favourite group.
CREATE UNIQUE INDEX IF NOT EXISTS idx_group_members_avatar_id_favourite ON group_members(avatar_id) WHERE favourite;
