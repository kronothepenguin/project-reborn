-- A ban covers the user (all of their habbos), an IP, or both; a NULL expires_at
-- is permanent. Deleting the user deletes their bans, since SET NULL could
-- leave a row with neither target.
CREATE TABLE IF NOT EXISTS bans (
    id INTEGER PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    ip TEXT,
    reason TEXT NOT NULL,
    issued_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at DATETIME NOT NULL,
    expires_at DATETIME,
    lifted_at DATETIME,
    lifted_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    CHECK (user_id IS NOT NULL OR ip IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_bans_user_id ON bans(user_id);

CREATE INDEX IF NOT EXISTS idx_bans_ip ON bans(ip);

CREATE TABLE IF NOT EXISTS alerts (
    id INTEGER PRIMARY KEY,
    avatar_id INTEGER NOT NULL REFERENCES avatars(id) ON DELETE CASCADE,
    sender_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    created_at DATETIME NOT NULL,
    dismissed_at DATETIME
);

CREATE INDEX IF NOT EXISTS idx_alerts_avatar_id_dismissed_at ON alerts(avatar_id, dismissed_at);

CREATE TABLE IF NOT EXISTS help_tickets (
    id INTEGER PRIMARY KEY,
    avatar_id INTEGER REFERENCES avatars(id) ON DELETE SET NULL,
    forum_post_id INTEGER REFERENCES forum_posts(id) ON DELETE SET NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    ip TEXT NOT NULL,
    created_at DATETIME NOT NULL,
    picked_up_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    picked_up_at DATETIME,
    closed_at DATETIME
);

CREATE INDEX IF NOT EXISTS idx_help_tickets_closed_at ON help_tickets(closed_at);

CREATE TABLE IF NOT EXISTS staff_logs (
    id INTEGER PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    target_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    target_avatar_id INTEGER REFERENCES avatars(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    detail TEXT NOT NULL DEFAULT '',
    ip TEXT NOT NULL,
    created_at DATETIME NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_staff_logs_created_at ON staff_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_staff_logs_target_user_id ON staff_logs(target_user_id);

CREATE INDEX IF NOT EXISTS idx_staff_logs_target_avatar_id ON staff_logs(target_avatar_id);
