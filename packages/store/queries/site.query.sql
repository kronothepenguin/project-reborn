-- name: CreateBanner :one
INSERT INTO banners (title, image_url, link_url, enabled, created_at, updated_at)
VALUES (sqlc.arg(title), sqlc.arg(image_url), sqlc.arg(link_url), sqlc.arg(enabled), sqlc.arg(created_at), sqlc.arg(updated_at))
RETURNING *;

-- name: UpdateBanner :execrows
UPDATE banners
SET
    title = sqlc.arg(title),
    image_url = sqlc.arg(image_url),
    link_url = sqlc.arg(link_url),
    enabled = sqlc.arg(enabled),
    updated_at = sqlc.arg(updated_at)
WHERE id = sqlc.arg(id);

-- name: DeleteBanner :execrows
DELETE FROM banners WHERE id = sqlc.arg(id);

-- name: GetBanner :one
SELECT * FROM banners WHERE id = sqlc.arg(id);

-- Holo showed banners in the order they were added.
-- name: ListBanners :many
SELECT * FROM banners ORDER BY position, id;

-- name: ListEnabledBanners :many
SELECT * FROM banners WHERE enabled ORDER BY position, id;
