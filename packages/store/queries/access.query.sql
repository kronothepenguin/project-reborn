-- name: CreateAccessGroup :one
INSERT INTO access_groups (name, description, staff_listed, created_at, updated_at)
VALUES (
    sqlc.arg(name), sqlc.arg(description), sqlc.arg(staff_listed), sqlc.arg(created_at),
    sqlc.arg(updated_at)
)
RETURNING *;

-- name: AddAccessGroupAttribute :exec
INSERT INTO access_group_attributes (access_group_id, attribute)
VALUES (sqlc.arg(access_group_id), sqlc.arg(attribute))
ON CONFLICT (access_group_id, attribute) DO NOTHING;

-- name: RemoveAccessGroupAttribute :exec
DELETE FROM access_group_attributes
WHERE access_group_id = sqlc.arg(access_group_id) AND attribute = sqlc.arg(attribute);

-- name: AddAccessGroupMember :exec
INSERT INTO access_group_members (access_group_id, user_id, display_avatar_id, granted_at, granted_by_user_id)
VALUES (
    sqlc.arg(access_group_id), sqlc.arg(user_id), sqlc.narg(display_avatar_id), sqlc.arg(granted_at),
    sqlc.narg(granted_by_user_id)
);

-- name: RemoveAccessGroupMember :exec
DELETE FROM access_group_members
WHERE access_group_id = sqlc.arg(access_group_id) AND user_id = sqlc.arg(user_id);

-- name: ListUserAttributes :many
SELECT DISTINCT access_group_attributes.attribute
FROM access_group_attributes
JOIN access_group_members ON access_group_members.access_group_id = access_group_attributes.access_group_id
WHERE access_group_members.user_id = sqlc.arg(user_id)
ORDER BY access_group_attributes.attribute;

-- name: ListAttributeHolders :many
SELECT DISTINCT access_group_members.user_id
FROM access_group_members
JOIN access_group_attributes ON access_group_attributes.access_group_id = access_group_members.access_group_id
WHERE access_group_attributes.attribute = sqlc.arg(attribute)
ORDER BY access_group_members.user_id;
