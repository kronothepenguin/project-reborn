-- name: CreateProfile :one
INSERT INTO profiles (avatar_id, created_at, updated_at)
VALUES (sqlc.arg(avatar_id), sqlc.arg(created_at), sqlc.arg(updated_at))
RETURNING *;
