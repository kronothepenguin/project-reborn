-- name: ListRoomCategories :many
SELECT * FROM room_categories ORDER BY id;

-- name: ListRoomModels :many
SELECT * FROM room_models ORDER BY id;

-- name: ListPublicRooms :many
SELECT * FROM public_rooms ORDER BY id;

-- name: CreateRoom :one
INSERT INTO rooms (
    creator_avatar_id, owner_avatar_id, room_category_id, room_model_id, name, door, show_owner, created_at, updated_at
) VALUES (
    sqlc.arg(avatar_id), sqlc.arg(avatar_id), sqlc.arg(room_category_id), sqlc.arg(room_model_id), sqlc.arg(name),
    sqlc.arg(door), sqlc.arg(show_owner), sqlc.arg(created_at), sqlc.arg(created_at)
)
RETURNING *;

-- name: GetRoom :one
SELECT rooms.*, avatars.name AS owner_name
FROM rooms
JOIN avatars ON avatars.id = rooms.owner_avatar_id
WHERE rooms.id = sqlc.arg(id);

-- name: SumCategoryMaxVisitors :one
SELECT CAST(COALESCE(SUM(max_visitors), 0) AS INTEGER) FROM rooms WHERE room_category_id = sqlc.arg(room_category_id);

-- name: CountAvatarRooms :one
SELECT COUNT(*) FROM rooms WHERE owner_avatar_id = sqlc.arg(avatar_id);

-- name: ListAvatarRooms :many
SELECT rooms.*, avatars.name AS owner_name
FROM rooms
JOIN avatars ON avatars.id = rooms.owner_avatar_id
WHERE rooms.owner_avatar_id = sqlc.arg(avatar_id)
ORDER BY rooms.id;

-- name: ListCategoryRooms :many
SELECT rooms.*, avatars.name AS owner_name
FROM rooms
JOIN avatars ON avatars.id = rooms.owner_avatar_id
WHERE rooms.room_category_id = sqlc.arg(room_category_id)
ORDER BY rooms.id
LIMIT sqlc.arg(max_rooms);

-- The pattern escapes %, _ and ! with !, so that a query finds those characters as they are. sqlc leaves the
-- arguments after an ESCAPE clause unbound, so the LIKE comes last.
-- name: SearchRooms :many
SELECT rooms.*, avatars.name AS owner_name
FROM rooms
JOIN avatars ON avatars.id = rooms.owner_avatar_id
WHERE avatars.name = CAST(sqlc.arg(owner_name) AS TEXT) OR (rooms.name LIKE CAST(sqlc.arg(name_pattern) AS TEXT) ESCAPE '!')
ORDER BY rooms.id
LIMIT sqlc.arg(max_rooms);

-- name: ListRandomRooms :many
SELECT rooms.*, avatars.name AS owner_name
FROM rooms
JOIN avatars ON avatars.id = rooms.owner_avatar_id
ORDER BY random()
LIMIT sqlc.arg(max_rooms);

-- name: UpdateRoomInfo :execrows
UPDATE rooms SET name = sqlc.arg(name), door = sqlc.arg(door), show_owner = sqlc.arg(show_owner), updated_at = sqlc.arg(updated_at)
WHERE id = sqlc.arg(id) AND owner_avatar_id = sqlc.arg(owner_avatar_id);

-- name: UpdateRoomSettings :execrows
UPDATE rooms
SET description = sqlc.arg(description), others_move_furni = sqlc.arg(others_move_furni), max_visitors = sqlc.arg(max_visitors),
    updated_at = sqlc.arg(updated_at)
WHERE id = sqlc.arg(id) AND owner_avatar_id = sqlc.arg(owner_avatar_id);

-- name: SetRoomPassword :execrows
UPDATE rooms SET password_hash = CAST(sqlc.arg(password_hash) AS TEXT), updated_at = sqlc.arg(updated_at)
WHERE id = sqlc.arg(id) AND owner_avatar_id = sqlc.arg(owner_avatar_id);

-- name: SetRoomCategory :execrows
UPDATE rooms SET room_category_id = sqlc.arg(room_category_id), updated_at = sqlc.arg(updated_at)
WHERE id = sqlc.arg(id) AND owner_avatar_id = sqlc.arg(owner_avatar_id);

-- name: DeleteRoom :execrows
DELETE FROM rooms WHERE id = sqlc.arg(id) AND owner_avatar_id = sqlc.arg(owner_avatar_id);

-- name: ListFavouritePublicRooms :many
SELECT CAST(public_room_id AS INTEGER) AS public_room_id FROM favourite_rooms
WHERE avatar_id = sqlc.arg(avatar_id) AND public_room_id IS NOT NULL
ORDER BY created_at, public_room_id;

-- name: ListFavouriteRooms :many
SELECT rooms.*, avatars.name AS owner_name
FROM favourite_rooms
JOIN rooms ON rooms.id = favourite_rooms.room_id
JOIN avatars ON avatars.id = rooms.owner_avatar_id
WHERE favourite_rooms.avatar_id = sqlc.arg(avatar_id)
ORDER BY favourite_rooms.created_at, rooms.id;

-- name: CountFavouriteRooms :one
SELECT COUNT(*) FROM favourite_rooms WHERE avatar_id = sqlc.arg(avatar_id);

-- name: AddFavouritePublicRoom :exec
INSERT INTO favourite_rooms (avatar_id, public_room_id, created_at)
VALUES (sqlc.arg(avatar_id), CAST(sqlc.arg(public_room_id) AS INTEGER), sqlc.arg(created_at))
ON CONFLICT DO NOTHING;

-- name: AddFavouriteRoom :exec
INSERT INTO favourite_rooms (avatar_id, room_id, created_at)
VALUES (sqlc.arg(avatar_id), CAST(sqlc.arg(room_id) AS INTEGER), sqlc.arg(created_at))
ON CONFLICT DO NOTHING;

-- name: RemoveFavouritePublicRoom :exec
DELETE FROM favourite_rooms WHERE avatar_id = sqlc.arg(avatar_id) AND public_room_id = CAST(sqlc.arg(public_room_id) AS INTEGER);

-- name: RemoveFavouriteRoom :exec
DELETE FROM favourite_rooms WHERE avatar_id = sqlc.arg(avatar_id) AND room_id = CAST(sqlc.arg(room_id) AS INTEGER);
