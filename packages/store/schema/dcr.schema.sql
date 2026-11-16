-- The client's external variables and texts, one row per line of
-- external_variables.txt and external_texts.txt; id keeps the file's order.
CREATE TABLE IF NOT EXISTS dcr_variables (
    id INTEGER PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS dcr_texts (
    id INTEGER PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL
);
