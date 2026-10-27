-- key is a setting key path declared in packages/virtual (site.name); value is a
-- JSON literal of the setting's type ("Habbo", true, 20).
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at DATETIME NOT NULL,
    updated_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL
);
