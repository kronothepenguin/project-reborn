-- name: CreateFurni :one
INSERT INTO furni (furni_definition_id, user_id, avatar_id, state, created_at)
VALUES (sqlc.arg(furni_definition_id), sqlc.arg(user_id), sqlc.narg(avatar_id), sqlc.arg(state), sqlc.arg(created_at))
RETURNING *;

-- name: CountHandFurni :one
SELECT COUNT(*) FROM furni WHERE avatar_id = CAST(sqlc.arg(avatar_id) AS INTEGER);

-- name: ListHandFurni :many
SELECT * FROM furni
WHERE avatar_id = CAST(sqlc.arg(avatar_id) AS INTEGER)
ORDER BY id
LIMIT sqlc.arg(page_size) OFFSET sqlc.arg(skip);
