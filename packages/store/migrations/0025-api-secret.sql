-- The game's /api/ gets the secret that programs run apart send it.
-- One row, with 32 random bytes as hex, generated once on each hotel.

CREATE TABLE IF NOT EXISTS api_secret (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    secret TEXT NOT NULL
);

INSERT OR IGNORE INTO api_secret (id, secret) VALUES (1, lower(hex(randomblob(32))));
