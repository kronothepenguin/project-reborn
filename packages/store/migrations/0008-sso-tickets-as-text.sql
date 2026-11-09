-- SSO tickets kept as text with the CMS session that made them, so the client page can show one and the game server can spend it.

-- No program ever made a ticket of the old form, so the table is made again without copying its rows.
CREATE TABLE sso_tickets_new (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    avatar_id INTEGER NOT NULL REFERENCES avatars(id) ON DELETE CASCADE,
    ip TEXT NOT NULL,
    created_at DATETIME NOT NULL
);

DROP TABLE sso_tickets;

ALTER TABLE sso_tickets_new RENAME TO sso_tickets;

CREATE INDEX idx_sso_tickets_session_id ON sso_tickets(session_id);

CREATE INDEX idx_sso_tickets_avatar_id ON sso_tickets(avatar_id);
