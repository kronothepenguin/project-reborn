-- name: CreateAvatar :one
INSERT INTO avatars (user_id, name, figure, gender, motto, created_at, updated_at)
VALUES (
    sqlc.arg(user_id), sqlc.arg(name), sqlc.arg(figure), sqlc.arg(gender), sqlc.arg(motto),
    sqlc.arg(created_at), sqlc.arg(updated_at)
)
RETURNING *;

-- name: GetAvatar :one
SELECT * FROM avatars WHERE id = sqlc.arg(id);

-- It sees archived habbos too, because their names stay taken.
-- name: GetAvatarByName :one
SELECT * FROM avatars WHERE name = sqlc.arg(name);

-- name: ListUserAvatars :many
SELECT * FROM avatars
WHERE user_id = sqlc.arg(user_id) AND archived_at IS NULL
ORDER BY created_at, id;

-- name: CountAvatars :one
SELECT COUNT(*) FROM avatars WHERE archived_at IS NULL;

-- name: ListRandomAvatars :many
SELECT * FROM avatars
WHERE archived_at IS NULL
ORDER BY RANDOM()
LIMIT sqlc.arg(count);

-- name: UpdateAvatarMotto :exec
UPDATE avatars SET motto = sqlc.arg(motto), updated_at = sqlc.arg(updated_at)
WHERE id = sqlc.arg(id);

-- name: UpdateAvatarLook :exec
UPDATE avatars SET figure = sqlc.arg(figure), gender = sqlc.arg(gender), updated_at = sqlc.arg(updated_at)
WHERE id = sqlc.arg(id);

-- name: ArchiveAvatar :execrows
UPDATE avatars SET archived_at = sqlc.arg(archived_at), updated_at = sqlc.arg(updated_at)
WHERE id = sqlc.arg(id) AND user_id = sqlc.arg(user_id) AND archived_at IS NULL;
