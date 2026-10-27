CREATE TABLE IF NOT EXISTS wallets (
    avatar_id INTEGER PRIMARY KEY REFERENCES avatars(id) ON DELETE CASCADE,
    credits INTEGER NOT NULL DEFAULT 0 CHECK (credits >= 0),
    tickets INTEGER NOT NULL DEFAULT 0 CHECK (tickets >= 0),
    film INTEGER NOT NULL DEFAULT 0 CHECK (film >= 0),
    updated_at DATETIME NOT NULL
);

-- Every change of wallets.credits writes one row here in the same transaction.
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id INTEGER PRIMARY KEY,
    avatar_id INTEGER NOT NULL REFERENCES avatars(id) ON DELETE CASCADE,
    credits INTEGER NOT NULL,
    reason TEXT NOT NULL,
    detail TEXT NOT NULL DEFAULT '',
    created_at DATETIME NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_avatar_id_created_at ON wallet_transactions(avatar_id, created_at);

CREATE TABLE IF NOT EXISTS vouchers (
    code TEXT NOT NULL COLLATE NOCASE PRIMARY KEY,
    credits INTEGER NOT NULL CHECK (credits > 0),
    created_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at DATETIME NOT NULL,
    redeemed_by_avatar_id INTEGER REFERENCES avatars(id) ON DELETE SET NULL,
    redeemed_at DATETIME
);
