CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    username TEXT NOT NULL,
    username_canonical TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    email TEXT NOT NULL,
    email_canonical TEXT NOT NULL UNIQUE,
    birth_date INTEGER NOT NULL,
    avatar TEXT NOT NULL,
    motto TEXT NOT NULL DEFAULT '',
    newsletter INTEGER NOT NULL DEFAULT 0,
    terms_accepted_at INTEGER NOT NULL,
    is_admin INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL,
    last_signed_in_at INTEGER NOT NULL DEFAULT 0
);
