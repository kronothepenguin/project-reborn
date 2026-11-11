-- name: CreateFurni :one
INSERT INTO furni (furni_definition_id, user_id, avatar_id, box_furni_id, state, created_at)
VALUES (
    sqlc.arg(furni_definition_id), sqlc.arg(user_id), sqlc.narg(avatar_id), sqlc.narg(box_furni_id), sqlc.arg(state),
    sqlc.arg(created_at)
)
RETURNING *;

-- name: CountHandFurni :one
SELECT COUNT(*) FROM furni WHERE avatar_id = CAST(sqlc.arg(avatar_id) AS INTEGER);

-- name: ListHandFurni :many
SELECT * FROM furni
WHERE avatar_id = CAST(sqlc.arg(avatar_id) AS INTEGER)
ORDER BY id
LIMIT sqlc.arg(page_size) OFFSET sqlc.arg(skip);

-- name: ListRoomFurni :many
SELECT * FROM furni WHERE room_id = CAST(sqlc.arg(room_id) AS INTEGER) ORDER BY id;

-- name: GetFurni :one
SELECT * FROM furni WHERE id = sqlc.arg(id);

-- Out of the habbo's hand and into the room: no row changes when the hand does not hold the furni.
-- name: PlaceFurni :execrows
UPDATE furni
SET avatar_id = NULL, room_id = CAST(sqlc.arg(room_id) AS INTEGER), x = sqlc.arg(x), y = sqlc.arg(y),
    altitude = sqlc.arg(altitude), direction = sqlc.arg(direction), wall_position = sqlc.arg(wall_position)
WHERE id = sqlc.arg(id) AND avatar_id = CAST(sqlc.arg(avatar_id) AS INTEGER);

-- name: MoveFurni :execrows
UPDATE furni
SET x = sqlc.arg(x), y = sqlc.arg(y), altitude = sqlc.arg(altitude), direction = sqlc.arg(direction)
WHERE id = sqlc.arg(id) AND room_id = CAST(sqlc.arg(room_id) AS INTEGER);

-- Out of the room and into the hand of the habbo that picks it up, whose user it then belongs to (plans/server
-- decision 0103).
-- name: PickUpFurni :execrows
UPDATE furni
SET user_id = sqlc.arg(user_id), avatar_id = CAST(sqlc.arg(avatar_id) AS INTEGER), room_id = NULL,
    x = 0, y = 0, altitude = 0, direction = 0, wall_position = ''
WHERE id = sqlc.arg(id) AND room_id = CAST(sqlc.arg(room_id) AS INTEGER);

-- Everything that stands in the room goes to one habbo's hand, before the room goes (plans/server decision 0059).
-- name: MoveRoomFurniToHand :exec
UPDATE furni
SET user_id = sqlc.arg(user_id), avatar_id = CAST(sqlc.arg(avatar_id) AS INTEGER), room_id = NULL,
    x = 0, y = 0, altitude = 0, direction = 0, wall_position = ''
WHERE room_id = CAST(sqlc.arg(room_id) AS INTEGER);

-- name: ListBoxFurni :many
SELECT * FROM furni WHERE box_furni_id = CAST(sqlc.arg(box_furni_id) AS INTEGER) ORDER BY id;

-- What waits in the box goes to the hand of the habbo that opens it, whose user it then belongs to.
-- name: UnboxFurni :exec
UPDATE furni
SET user_id = sqlc.arg(user_id), avatar_id = CAST(sqlc.arg(avatar_id) AS INTEGER), box_furni_id = NULL
WHERE box_furni_id = CAST(sqlc.arg(box_furni_id) AS INTEGER);

-- name: DeleteRoomFurni :execrows
DELETE FROM furni WHERE id = sqlc.arg(id) AND room_id = CAST(sqlc.arg(room_id) AS INTEGER);

-- name: SetRoomFurniState :execrows
UPDATE furni SET state = sqlc.arg(state) WHERE id = sqlc.arg(id) AND room_id = CAST(sqlc.arg(room_id) AS INTEGER);

-- A furni that is used up leaves its habbo's hand for good: no row changes when the hand does not hold it.
-- name: DeleteHandFurni :execrows
DELETE FROM furni WHERE id = sqlc.arg(id) AND avatar_id = CAST(sqlc.arg(avatar_id) AS INTEGER);
