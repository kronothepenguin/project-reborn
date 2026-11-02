-- A user is a club member while any period covers the current time.
CREATE TABLE IF NOT EXISTS club_subscriptions (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    starts_at DATETIME NOT NULL,
    ends_at DATETIME NOT NULL,
    created_at DATETIME NOT NULL,
    CHECK (ends_at > starts_at)
);

CREATE INDEX IF NOT EXISTS idx_club_subscriptions_user_id_ends_at ON club_subscriptions(user_id, ends_at);
