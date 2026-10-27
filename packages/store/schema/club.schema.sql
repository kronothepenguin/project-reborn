-- A habbo is a club member while any period covers the current time.
CREATE TABLE IF NOT EXISTS club_subscriptions (
    id INTEGER PRIMARY KEY,
    avatar_id INTEGER NOT NULL REFERENCES avatars(id) ON DELETE CASCADE,
    starts_at DATETIME NOT NULL,
    ends_at DATETIME NOT NULL,
    created_at DATETIME NOT NULL,
    CHECK (ends_at > starts_at)
);

CREATE INDEX IF NOT EXISTS idx_club_subscriptions_avatar_id_ends_at ON club_subscriptions(avatar_id, ends_at);
