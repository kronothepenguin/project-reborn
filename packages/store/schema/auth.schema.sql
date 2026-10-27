CREATE TABLE IF NOT EXISTS credentials (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    password_hash TEXT NOT NULL,
    updated_at DATETIME NOT NULL
);

-- id is the SHA-256 digest of the cookie token; the token itself is never stored.
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    avatar_id INTEGER NOT NULL REFERENCES avatars(id) ON DELETE CASCADE,
    remember BOOLEAN NOT NULL DEFAULT FALSE,
    ip TEXT NOT NULL,
    user_agent TEXT NOT NULL,
    created_at DATETIME NOT NULL,
    last_seen_at DATETIME NOT NULL,
    expires_at DATETIME NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);

CREATE INDEX IF NOT EXISTS idx_sessions_avatar_id ON sessions(avatar_id);

CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

CREATE TABLE IF NOT EXISTS login_attempts (
    id INTEGER PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    avatar_id INTEGER REFERENCES avatars(id) ON DELETE SET NULL,
    ip TEXT NOT NULL,
    succeeded BOOLEAN NOT NULL,
    created_at DATETIME NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_login_attempts_ip_created_at ON login_attempts(ip, created_at);

CREATE INDEX IF NOT EXISTS idx_login_attempts_user_id_created_at ON login_attempts(user_id, created_at);

CREATE INDEX IF NOT EXISTS idx_login_attempts_avatar_id_created_at ON login_attempts(avatar_id, created_at);

-- id is the SHA-256 digest of the emailed token.
CREATE TABLE IF NOT EXISTS password_resets (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at DATETIME NOT NULL,
    expires_at DATETIME NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_password_resets_user_id ON password_resets(user_id);

-- id is the SHA-256 digest of the ticket handed to the game client.
CREATE TABLE IF NOT EXISTS sso_tickets (
    id TEXT PRIMARY KEY,
    avatar_id INTEGER NOT NULL REFERENCES avatars(id) ON DELETE CASCADE,
    ip TEXT NOT NULL,
    created_at DATETIME NOT NULL,
    expires_at DATETIME NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sso_tickets_avatar_id ON sso_tickets(avatar_id);
