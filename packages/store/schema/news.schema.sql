CREATE TABLE IF NOT EXISTS news_articles (
    id INTEGER PRIMARY KEY,
    avatar_id INTEGER REFERENCES avatars(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    image_url TEXT NOT NULL DEFAULT '',
    summary TEXT NOT NULL,
    body TEXT NOT NULL,
    published_at DATETIME NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_news_articles_published_at ON news_articles(published_at);
