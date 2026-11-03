-- CAST keeps profile_id a non-null parameter although homes.profile_id is nullable.
-- name: CreateProfileHome :one
INSERT INTO homes (profile_id, updated_at)
VALUES (CAST(sqlc.arg(profile_id) AS INTEGER), sqlc.arg(updated_at))
RETURNING *;

-- name: GetProfileHome :one
SELECT homes.* FROM homes
JOIN profiles ON profiles.id = homes.profile_id
WHERE profiles.avatar_id = sqlc.arg(avatar_id);

-- name: GetHome :one
SELECT * FROM homes WHERE id = sqlc.arg(id);

-- name: GetHomeHabbo :one
SELECT avatars.* FROM avatars
JOIN profiles ON profiles.avatar_id = avatars.id
JOIN homes ON homes.profile_id = profiles.id
WHERE homes.id = sqlc.arg(home_id);

-- name: SetHomeBackground :exec
UPDATE homes
SET background_home_store_item_id = sqlc.narg(background_home_store_item_id), updated_at = sqlc.arg(updated_at)
WHERE id = sqlc.arg(id);

-- Items lower in the stack come first, so that a page drawing them in order needs
-- no z-index to look right.
-- name: ListHomeItems :many
SELECT * FROM home_items
WHERE home_id = sqlc.arg(home_id)
ORDER BY z, id;

-- name: CountHomeItems :one
SELECT COUNT(*) FROM home_items WHERE home_id = sqlc.arg(home_id);

-- name: GetHomeItem :one
SELECT * FROM home_items WHERE id = sqlc.arg(id) AND home_id = sqlc.arg(home_id);

-- name: CreateHomeItem :one
INSERT INTO home_items (
    home_id, kind, home_store_item_id, widget, skin, body, x, y, z, created_by_avatar_id, created_at, updated_at
)
VALUES (
    sqlc.arg(home_id), sqlc.arg(kind), sqlc.narg(home_store_item_id), sqlc.narg(widget), sqlc.arg(skin),
    sqlc.arg(body), sqlc.arg(x), sqlc.arg(y), sqlc.arg(z), sqlc.narg(created_by_avatar_id), sqlc.arg(created_at),
    sqlc.arg(updated_at)
)
RETURNING *;

-- name: MoveHomeItem :execrows
UPDATE home_items SET x = sqlc.arg(x), y = sqlc.arg(y), z = sqlc.arg(z), updated_at = sqlc.arg(updated_at)
WHERE id = sqlc.arg(id) AND home_id = sqlc.arg(home_id);

-- name: SkinHomeItem :execrows
UPDATE home_items SET skin = sqlc.arg(skin), updated_at = sqlc.arg(updated_at)
WHERE id = sqlc.arg(id) AND home_id = sqlc.arg(home_id);

-- name: DeleteHomeItem :execrows
DELETE FROM home_items WHERE id = sqlc.arg(id) AND home_id = sqlc.arg(home_id);
