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

-- Each item with the art of its store item, which a widget does not have, and
-- the user whose habbo placed it, 0 for none.
-- name: ListHomeItemsToDraw :many
SELECT home_items.id, home_items.kind, home_items.widget, home_items.skin, home_items.body, home_items.x, home_items.y,
       home_items.z, CAST(COALESCE(home_store_items.asset, '') AS TEXT) AS asset,
       CAST(COALESCE(avatars.user_id, 0) AS INTEGER) AS placer_user_id
FROM home_items
LEFT JOIN home_store_items ON home_store_items.id = home_items.home_store_item_id
LEFT JOIN avatars ON avatars.id = home_items.created_by_avatar_id
WHERE home_items.home_id = sqlc.arg(home_id)
ORDER BY home_items.z, home_items.id;

-- The user whose habbo placed an item, which 0083 gives it back to.
-- name: GetHomeItemPlacer :one
SELECT avatars.user_id FROM home_items
JOIN avatars ON avatars.id = home_items.created_by_avatar_id
WHERE home_items.id = sqlc.arg(id);

-- name: CountHomeWidgets :one
SELECT COUNT(*) FROM home_items
WHERE home_id = sqlc.arg(home_id) AND kind = 'widget' AND widget = sqlc.arg(widget);

-- CAST keeps group_id a non-null parameter although homes.group_id is nullable.
-- name: CreateGroupHome :one
INSERT INTO homes (group_id, updated_at)
VALUES (CAST(sqlc.arg(group_id) AS INTEGER), sqlc.arg(updated_at))
RETURNING *;

-- CAST keeps group_id a non-null parameter, as in CreateGroupHome.
-- name: GetGroupHome :one
SELECT * FROM homes WHERE group_id = CAST(sqlc.arg(group_id) AS INTEGER);

-- Every sticker and note of the home goes back to the user whose habbo placed it,
-- a note blank as the item it came from (0083).
-- name: ReturnHomeItemsToPlacers :exec
INSERT INTO home_inventories (user_id, home_store_item_id, quantity)
SELECT avatars.user_id, home_items.home_store_item_id, COUNT(*)
FROM home_items
JOIN avatars ON avatars.id = home_items.created_by_avatar_id
WHERE home_items.home_id = sqlc.arg(home_id) AND home_items.kind IN ('sticker', 'note')
  AND home_items.home_store_item_id IS NOT NULL
GROUP BY avatars.user_id, home_items.home_store_item_id
ON CONFLICT (user_id, home_store_item_id) DO UPDATE SET quantity = home_inventories.quantity + excluded.quantity;
