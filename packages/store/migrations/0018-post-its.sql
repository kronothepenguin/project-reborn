-- A post-it keeps what a habbo wrote on it.

-- What a habbo wrote on a post-it that hangs on a wall. A post-it nobody wrote on has no row. The post-it's colour
-- is its furni's state.
CREATE TABLE IF NOT EXISTS furni_notes (
    furni_id INTEGER PRIMARY KEY REFERENCES furni(id) ON DELETE CASCADE,
    text TEXT NOT NULL
);
