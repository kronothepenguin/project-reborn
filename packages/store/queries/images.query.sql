-- name: CreateImage :one
INSERT INTO images (format, data, width, height, created_at, created_by_user_id)
VALUES (
    sqlc.arg(format), sqlc.arg(data), sqlc.arg(width), sqlc.arg(height), sqlc.arg(created_at),
    sqlc.narg(created_by_user_id)
)
RETURNING id;

-- name: GetImage :one
SELECT format, data FROM images WHERE id = sqlc.arg(id);
