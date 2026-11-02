-- name: CountGroups :one
SELECT COUNT(*) FROM groups;

-- name: CountGroupsOwnedBy :one
SELECT COUNT(*) FROM groups WHERE avatar_id = sqlc.arg(avatar_id);
