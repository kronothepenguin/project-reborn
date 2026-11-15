-- A teleport knows the other teleport of its pair.
-- decision server/0111.

ALTER TABLE furni ADD COLUMN partner_furni_id INTEGER REFERENCES furni(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_furni_partner_furni_id ON furni (partner_furni_id);
