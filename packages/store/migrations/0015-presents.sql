-- A furni may wait inside a present, the box that holds it.
-- plans/server decision 0094.

ALTER TABLE furni ADD COLUMN box_furni_id INTEGER REFERENCES furni(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_furni_box_furni_id ON furni (box_furni_id);
