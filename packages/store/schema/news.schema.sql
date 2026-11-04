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
    updated_at DATETIME NOT NULL,
    -- The uploaded picture image_url shows, if it shows one. Update 0006 added
    -- the column, which puts it last in a database it updated. The default
    -- action refuses to delete a picture in use with the error IsForeignKey
    -- knows; ON DELETE RESTRICT would refuse it through a trigger's error.
    image_id INTEGER REFERENCES images(id)
);

CREATE INDEX IF NOT EXISTS idx_news_articles_published_at ON news_articles(published_at);

CREATE INDEX IF NOT EXISTS idx_news_articles_image_id ON news_articles(image_id);
