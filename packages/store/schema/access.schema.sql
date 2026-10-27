CREATE TABLE IF NOT EXISTS access_groups (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL COLLATE NOCASE,
    description TEXT NOT NULL DEFAULT '',
    staff_listed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_access_groups_name ON access_groups(name);

CREATE TABLE IF NOT EXISTS access_group_attributes (
    access_group_id INTEGER NOT NULL REFERENCES access_groups(id) ON DELETE CASCADE,
    attribute TEXT NOT NULL,
    PRIMARY KEY (access_group_id, attribute)
);

-- display_avatar_id must be one of the member's own habbos; the application
-- enforces it because a composite foreign key cannot SET NULL one column only.
CREATE TABLE IF NOT EXISTS access_group_members (
    access_group_id INTEGER NOT NULL REFERENCES access_groups(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    display_avatar_id INTEGER REFERENCES avatars(id) ON DELETE SET NULL,
    granted_at DATETIME NOT NULL,
    granted_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    PRIMARY KEY (access_group_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_access_group_members_user_id ON access_group_members(user_id);
