CREATE TABLE IF NOT EXISTS referrals (
    referred_user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    referrer_avatar_id INTEGER REFERENCES avatars(id) ON DELETE SET NULL,
    created_at DATETIME NOT NULL,
    rewarded_at DATETIME
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer_avatar_id ON referrals(referrer_avatar_id);
