CREATE TABLE IF NOT EXISTS profiles (
    id INTEGER PRIMARY KEY,
    avatar_id INTEGER NOT NULL REFERENCES avatars(id) ON DELETE CASCADE,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_avatar_id ON profiles(avatar_id);

CREATE TABLE IF NOT EXISTS profile_tags (
    profile_id INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    tag TEXT NOT NULL,
    created_at DATETIME NOT NULL,
    PRIMARY KEY (profile_id, tag)
);

CREATE INDEX IF NOT EXISTS idx_profile_tags_tag ON profile_tags(tag);
