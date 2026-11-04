-- name: CreateImage :one
INSERT INTO images (format, data, width, height, created_at, created_by_user_id)
VALUES (
    sqlc.arg(format), sqlc.arg(data), sqlc.arg(width), sqlc.arg(height), sqlc.arg(created_at),
    sqlc.narg(created_by_user_id)
)
RETURNING id;

-- name: GetImage :one
SELECT format, data FROM images WHERE id = sqlc.arg(id);

-- Newest first, with the size of the bytes, the first habbo of the user who
-- uploaded the image, as the staff log names users, and how many articles show it.
-- name: ListImages :many
SELECT
    images.id,
    images.format,
    CAST(length(images.data) AS INTEGER) AS size,
    images.created_at,
    images.created_by_user_id,
    CAST(COALESCE((
        SELECT avatars.name FROM avatars
        WHERE avatars.user_id = images.created_by_user_id
        ORDER BY avatars.created_at, avatars.id
        LIMIT 1
    ), '') AS TEXT) AS uploader,
    (SELECT COUNT(*) FROM news_articles WHERE news_articles.image_id = images.id) AS articles
FROM images
ORDER BY images.created_at DESC, images.id DESC;

-- name: ListImageArticles :many
SELECT id, title
FROM news_articles
WHERE image_id = sqlc.arg(image_id)
ORDER BY published_at DESC, id DESC;

-- The link of news_articles refuses to delete an image an article shows.
-- name: DeleteImage :execrows
DELETE FROM images WHERE id = sqlc.arg(id);
