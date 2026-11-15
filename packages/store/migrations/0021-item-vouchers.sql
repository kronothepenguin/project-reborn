-- A voucher gives credits or one furni.
-- decision server/0120. Every voucher there is gives credits, and keeps them.

CREATE TABLE vouchers_new (
    code TEXT NOT NULL COLLATE NOCASE PRIMARY KEY,
    credits INTEGER NOT NULL DEFAULT 0 CHECK (credits >= 0),
    furni_definition_id INTEGER REFERENCES furni_definitions(id),
    created_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at DATETIME NOT NULL,
    redeemed_by_avatar_id INTEGER REFERENCES avatars(id) ON DELETE SET NULL,
    redeemed_at DATETIME,
    CHECK ((credits > 0) <> (furni_definition_id IS NOT NULL))
);

INSERT INTO vouchers_new (code, credits, created_by_user_id, created_at, redeemed_by_avatar_id, redeemed_at)
SELECT code, credits, created_by_user_id, created_at, redeemed_by_avatar_id, redeemed_at
FROM vouchers;

DROP TABLE vouchers;

ALTER TABLE vouchers_new RENAME TO vouchers;
