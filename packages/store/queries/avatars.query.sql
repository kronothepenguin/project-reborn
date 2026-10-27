-- name: CreateAvatar :one
INSERT INTO avatars (user_id, name, figure, gender, motto, created_at, updated_at)
VALUES (
    sqlc.arg(user_id), sqlc.arg(name), sqlc.arg(figure), sqlc.arg(gender), sqlc.arg(motto),
    sqlc.arg(created_at), sqlc.arg(updated_at)
)
RETURNING *;

-- name: GetAvatar :one
SELECT * FROM avatars WHERE id = sqlc.arg(id);

-- name: GetAvatarByName :one
SELECT * FROM avatars WHERE name = sqlc.arg(name);

-- name: ListUserAvatars :many
SELECT * FROM avatars
WHERE user_id = sqlc.arg(user_id)
ORDER BY created_at, id;
