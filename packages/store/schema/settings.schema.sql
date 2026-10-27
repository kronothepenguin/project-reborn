-- key is a config key path (site.name); value is a JSON literal ("Habbo", true, 20)
-- that overrides the config value with the same key.
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at DATETIME NOT NULL,
    updated_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL
);
