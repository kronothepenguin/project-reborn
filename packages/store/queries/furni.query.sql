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

-- A pad of post-its counts its notes in its state while a hand holds it: no row changes when the hand does not.
-- name: SetHandFurniState :execrows
UPDATE furni SET state = sqlc.arg(state) WHERE id = sqlc.arg(id) AND avatar_id = CAST(sqlc.arg(avatar_id) AS INTEGER);

-- The post-its of a room go with it, before the rest of its furni goes to a hand.
-- name: DeleteRoomPostIts :exec
DELETE FROM furni
WHERE room_id = CAST(sqlc.arg(room_id) AS INTEGER)
    AND furni_definition_id IN (SELECT id FROM furni_definitions WHERE sprite LIKE 'post.it%');

-- name: GetFurniNote :one
SELECT text FROM furni_notes WHERE furni_id = sqlc.arg(furni_id);

-- name: SetFurniNote :exec
INSERT INTO furni_notes (furni_id, text) VALUES (sqlc.arg(furni_id), sqlc.arg(text))
ON CONFLICT (furni_id) DO UPDATE SET text = excluded.text;

-- The two teleports of a pair name each other, once both exist.
-- name: SetFurniPartner :exec
UPDATE furni SET partner_furni_id = CAST(sqlc.arg(partner_furni_id) AS INTEGER) WHERE id = sqlc.arg(id);

-- A furni changes hands in a trade, and belongs to the taker's user: no row changes when the giver's hand does not
-- hold it.
-- name: TradeFurni :execrows
UPDATE furni
SET user_id = sqlc.arg(user_id), avatar_id = CAST(sqlc.arg(to_avatar_id) AS INTEGER)
WHERE id = sqlc.arg(id) AND avatar_id = CAST(sqlc.arg(from_avatar_id) AS INTEGER);

-- A user's shared inventory, a row for each kind of furni: the furni that no habbo holds, no room has, no present
-- holds and no recycler keeps (plans/holo-port decision 0057). A kind goes by the name of the first catalogue item
-- that sells it alone, or by its sprite.
-- name: ListSharedFurni :many
SELECT
    furni.furni_definition_id,
    CAST(COALESCE((
        SELECT catalogue_items.name
        FROM catalogue_items
        JOIN catalogue_item_furni ON catalogue_item_furni.catalogue_item_id = catalogue_items.id
        WHERE catalogue_item_furni.furni_definition_id = furni.furni_definition_id
            AND catalogue_item_furni.amount = 1
            AND (SELECT COUNT(*) FROM catalogue_item_furni AS given WHERE given.catalogue_item_id = catalogue_items.id) = 1
        ORDER BY catalogue_items.id
        LIMIT 1
    ), furni_definitions.sprite) AS TEXT) AS name,
    COUNT(*) AS amount
FROM furni
JOIN furni_definitions ON furni_definitions.id = furni.furni_definition_id
WHERE furni.user_id = sqlc.arg(user_id)
    AND furni.avatar_id IS NULL AND furni.room_id IS NULL
    AND furni.box_furni_id IS NULL AND furni.recycler_avatar_id IS NULL
GROUP BY furni.furni_definition_id
ORDER BY name, furni.furni_definition_id;

-- Every shared furni of one kind goes to a habbo's hand (plans/server decision 0123).
-- name: TakeSharedFurni :execrows
UPDATE furni
SET avatar_id = CAST(sqlc.arg(avatar_id) AS INTEGER)
WHERE user_id = sqlc.arg(user_id) AND furni_definition_id = sqlc.arg(furni_definition_id)
    AND avatar_id IS NULL AND room_id IS NULL AND box_furni_id IS NULL AND recycler_avatar_id IS NULL;

-- name: TakeAllSharedFurni :execrows
UPDATE furni
SET avatar_id = CAST(sqlc.arg(avatar_id) AS INTEGER)
WHERE user_id = sqlc.arg(user_id)
    AND avatar_id IS NULL AND room_id IS NULL AND box_furni_id IS NULL AND recycler_avatar_id IS NULL;

-- The hand of a habbo that goes, and what waits in its recycler, become shared (plans/server decision 0124).
-- name: ShareAvatarFurni :exec
UPDATE furni
SET avatar_id = NULL, recycler_avatar_id = NULL
WHERE avatar_id = CAST(sqlc.arg(avatar_id) AS INTEGER) OR recycler_avatar_id = CAST(sqlc.arg(avatar_id) AS INTEGER);
