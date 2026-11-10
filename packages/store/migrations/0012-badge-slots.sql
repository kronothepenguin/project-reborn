-- Badges worn in five slots, as the R26 client's badge window sets them: the badge a habbo wore takes slot 1.

CREATE TABLE avatar_badges_new (
    avatar_id INTEGER NOT NULL REFERENCES avatars(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    slot INTEGER NOT NULL DEFAULT 0 CHECK (slot BETWEEN 0 AND 5),
    granted_at DATETIME NOT NULL,
    PRIMARY KEY (avatar_id, code)
);

INSERT INTO avatar_badges_new (avatar_id, code, slot, granted_at)
SELECT avatar_id, code, CASE WHEN worn THEN 1 ELSE 0 END, granted_at
FROM avatar_badges;

DROP TABLE avatar_badges;

ALTER TABLE avatar_badges_new RENAME TO avatar_badges;

CREATE UNIQUE INDEX idx_avatar_badges_avatar_id_slot ON avatar_badges(avatar_id, slot) WHERE slot > 0;
