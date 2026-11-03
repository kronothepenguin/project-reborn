-- One row per update file applied to the database, written by the store's
-- update runner in the update's own transaction.
CREATE TABLE IF NOT EXISTS migrations (
    version INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    applied_at DATETIME NOT NULL
);
