-- A link from each news article to the uploaded picture it shows, so that a picture in use cannot be deleted.

ALTER TABLE news_articles ADD COLUMN image_id INTEGER REFERENCES images(id);

CREATE INDEX idx_news_articles_image_id ON news_articles(image_id);

UPDATE news_articles
SET image_id = images.id
FROM images
WHERE news_articles.image_url = '/news/images/' || images.id || '.' || images.format;
