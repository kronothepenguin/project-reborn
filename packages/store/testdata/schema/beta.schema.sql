CREATE TABLE IF NOT EXISTS gadgets (
    id INTEGER PRIMARY KEY,
    widget_id INTEGER NOT NULL REFERENCES widgets(id),
    label TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_gadgets_widget_id ON gadgets(widget_id);