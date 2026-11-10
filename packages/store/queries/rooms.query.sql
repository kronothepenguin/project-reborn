-- name: ListRoomRights :many
SELECT avatar_id FROM room_rights
WHERE room_id = sqlc.arg(room_id)
ORDER BY granted_at, avatar_id;

-- name: HasRoomRights :one
SELECT EXISTS (SELECT 1 FROM room_rights WHERE room_id = sqlc.arg(room_id) AND avatar_id = sqlc.arg(avatar_id));

-- name: AddRoomRights :exec
INSERT INTO room_rights (room_id, avatar_id, granted_at)
VALUES (sqlc.arg(room_id), sqlc.arg(avatar_id), sqlc.arg(granted_at))
ON CONFLICT DO NOTHING;

-- name: RemoveRoomRights :execrows
DELETE FROM room_rights WHERE room_id = sqlc.arg(room_id) AND avatar_id = sqlc.arg(avatar_id);

-- The habbos who lost their rights, so that those in the room learn it.
-- name: RemoveAllRoomRights :many
DELETE FROM room_rights WHERE room_id = sqlc.arg(room_id)
RETURNING avatar_id;

-- A new ban replaces an older one, so the latest end counts.
-- name: BanFromRoom :exec
INSERT INTO room_bans (room_id, avatar_id, expires_at)
VALUES (sqlc.arg(room_id), sqlc.arg(avatar_id), sqlc.arg(expires_at))
ON CONFLICT (room_id, avatar_id) DO UPDATE SET expires_at = excluded.expires_at;

-- name: GetRoomBanEnd :one
SELECT expires_at FROM room_bans
WHERE room_id = sqlc.arg(room_id) AND avatar_id = sqlc.arg(avatar_id) AND expires_at > sqlc.arg(now);

-- The bans in force, which load with the room.
-- name: ListRoomBans :many
SELECT avatar_id, expires_at FROM room_bans
WHERE room_id = sqlc.arg(room_id) AND expires_at > sqlc.arg(now)
ORDER BY avatar_id;

-- name: DeleteExpiredRoomBans :execrows
DELETE FROM room_bans WHERE expires_at <= sqlc.arg(now);

-- A habbo votes once: a second vote changes nothing.
-- name: AddRoomVote :execrows
INSERT INTO room_votes (room_id, avatar_id, vote, voted_at)
VALUES (sqlc.arg(room_id), sqlc.arg(avatar_id), sqlc.arg(vote), sqlc.arg(voted_at))
ON CONFLICT DO NOTHING;

-- name: HasVotedOnRoom :one
SELECT EXISTS (SELECT 1 FROM room_votes WHERE room_id = sqlc.arg(room_id) AND avatar_id = sqlc.arg(avatar_id));

-- name: GetRoomRating :one
SELECT CAST(COALESCE(SUM(vote), 0) AS INTEGER) AS rating, COUNT(*) AS votes
FROM room_votes
WHERE room_id = sqlc.arg(room_id);

-- name: AddChatMessage :exec
INSERT INTO chat_messages (public_room_id, room_id, avatar_id, kind, to_avatar_id, text, said_at)
VALUES (
    sqlc.narg(public_room_id), sqlc.narg(room_id), sqlc.arg(avatar_id), sqlc.arg(kind), sqlc.narg(to_avatar_id),
    sqlc.arg(text), sqlc.arg(said_at)
);

-- name: DeleteChatMessagesBefore :execrows
DELETE FROM chat_messages WHERE said_at < sqlc.arg(before);

-- name: ListIgnoredHabbos :many
SELECT ignored_habbos.ignored_avatar_id, avatars.name
FROM ignored_habbos
JOIN avatars ON avatars.id = ignored_habbos.ignored_avatar_id
WHERE ignored_habbos.avatar_id = sqlc.arg(avatar_id)
ORDER BY ignored_habbos.created_at, ignored_habbos.ignored_avatar_id;

-- name: IgnoreHabbo :exec
INSERT INTO ignored_habbos (avatar_id, ignored_avatar_id, created_at)
VALUES (sqlc.arg(avatar_id), sqlc.arg(ignored_avatar_id), sqlc.arg(created_at))
ON CONFLICT DO NOTHING;

-- name: UnignoreHabbo :execrows
DELETE FROM ignored_habbos WHERE avatar_id = sqlc.arg(avatar_id) AND ignored_avatar_id = sqlc.arg(ignored_avatar_id);

-- The Chat Log Viewer's search, as HoloCMS's: the lines said in the public room or the habbo room numbered room, or by
-- the habbo named name, whose names ignore case.
-- name: CountChatLog :one
SELECT COUNT(*) FROM chat_messages
JOIN avatars ON avatars.id = chat_messages.avatar_id
WHERE chat_messages.public_room_id = CAST(sqlc.arg(room) AS INTEGER) OR chat_messages.room_id = CAST(sqlc.arg(room) AS INTEGER)
   OR avatars.name = CAST(sqlc.arg(name) AS TEXT);

-- name: SearchChatLog :many
SELECT chat_messages.id, avatars.name, chat_messages.public_room_id, chat_messages.room_id, chat_messages.said_at,
       chat_messages.text
FROM chat_messages
JOIN avatars ON avatars.id = chat_messages.avatar_id
WHERE chat_messages.public_room_id = CAST(sqlc.arg(room) AS INTEGER) OR chat_messages.room_id = CAST(sqlc.arg(room) AS INTEGER)
   OR avatars.name = CAST(sqlc.arg(name) AS TEXT)
ORDER BY chat_messages.said_at DESC, chat_messages.id DESC
LIMIT sqlc.arg(row_limit) OFFSET sqlc.arg(row_offset);
