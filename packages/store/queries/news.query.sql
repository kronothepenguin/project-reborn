-- name: CreateNewsArticle :one
INSERT INTO news_articles (avatar_id, title, category, image_url, summary, body, published_at, created_at, updated_at)
VALUES (
    sqlc.narg(avatar_id), sqlc.arg(title), sqlc.arg(category), sqlc.arg(image_url), sqlc.arg(summary), sqlc.arg(body),
    sqlc.arg(published_at), sqlc.arg(created_at), sqlc.arg(updated_at)
)
RETURNING *;

-- Editing keeps the author and the date, as Holo's did.
-- name: UpdateNewsArticle :execrows
UPDATE news_articles
SET
    title = sqlc.arg(title),
    category = sqlc.arg(category),
    image_url = sqlc.arg(image_url),
    summary = sqlc.arg(summary),
    body = sqlc.arg(body),
    updated_at = sqlc.arg(updated_at)
WHERE id = sqlc.arg(id);

-- name: DeleteNewsArticle :execrows
DELETE FROM news_articles WHERE id = sqlc.arg(id);

-- name: GetNewsArticle :one
SELECT news_articles.*, CAST(COALESCE(avatars.name, '') AS TEXT) AS author
FROM news_articles
LEFT JOIN avatars ON avatars.id = news_articles.avatar_id
WHERE news_articles.id = sqlc.arg(id);

-- Newest first. Holo ordered by id, and the date only grows with it.
-- name: ListNewsArticles :many
SELECT
    news_articles.id,
    news_articles.title,
    news_articles.category,
    news_articles.summary,
    news_articles.published_at,
    CAST(COALESCE(avatars.name, '') AS TEXT) AS author
FROM news_articles
LEFT JOIN avatars ON avatars.id = news_articles.avatar_id
ORDER BY news_articles.published_at DESC, news_articles.id DESC;

-- name: ListLatestNewsArticles :many
SELECT id, title, summary, image_url, published_at
FROM news_articles
ORDER BY published_at DESC, id DESC
LIMIT sqlc.arg(row_limit);

-- name: ListNewsArticlesInCategory :many
SELECT id, title, published_at
FROM news_articles
WHERE category = sqlc.arg(category)
ORDER BY published_at DESC, id DESC
LIMIT sqlc.arg(row_limit);
