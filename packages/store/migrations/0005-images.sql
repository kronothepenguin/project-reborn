-- A table for the pictures that staff upload, such as the top stories of news.

CREATE TABLE images (
    id INTEGER PRIMARY KEY,
    format TEXT NOT NULL CHECK (format IN ('png', 'gif')),
    data BLOB NOT NULL,
    width INTEGER NOT NULL CHECK (width > 0),
    height INTEGER NOT NULL CHECK (height > 0),
    created_at DATETIME NOT NULL,
    created_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL
);
