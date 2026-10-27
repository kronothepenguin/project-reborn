CREATE TABLE IF NOT EXISTS forum_threads (
    id INTEGER PRIMARY KEY,
    avatar_id INTEGER REFERENCES avatars(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    sticky BOOLEAN NOT NULL DEFAULT FALSE,
    locked BOOLEAN NOT NULL DEFAULT FALSE,
    views INTEGER NOT NULL DEFAULT 0 CHECK (views >= 0),
    created_at DATETIME NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_forum_threads_created_at ON forum_threads(created_at);

CREATE TABLE IF NOT EXISTS forum_posts (
    id INTEGER PRIMARY KEY,
    forum_thread_id INTEGER NOT NULL REFERENCES forum_threads(id) ON DELETE CASCADE,
    avatar_id INTEGER REFERENCES avatars(id) ON DELETE SET NULL,
    body TEXT NOT NULL,
    created_at DATETIME NOT NULL,
    edited_at DATETIME,
    edited_by_avatar_id INTEGER REFERENCES avatars(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_forum_posts_forum_thread_id_created_at ON forum_posts(forum_thread_id, created_at);

CREATE INDEX IF NOT EXISTS idx_forum_posts_avatar_id ON forum_posts(avatar_id);
