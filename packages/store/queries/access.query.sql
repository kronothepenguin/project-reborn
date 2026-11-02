-- name: CreateAccessGroup :one
INSERT INTO access_groups (name, description, staff_listed, created_at, updated_at)
VALUES (
    sqlc.arg(name), sqlc.arg(description), sqlc.arg(staff_listed), sqlc.arg(created_at),
    sqlc.arg(updated_at)
)
RETURNING *;

-- name: GetAccessGroup :one
SELECT * FROM access_groups WHERE id = sqlc.arg(id);

-- name: ListAccessGroups :many
SELECT
    access_groups.*,
    (
        SELECT COUNT(*) FROM access_group_members
        WHERE access_group_members.access_group_id = access_groups.id
    ) AS member_count
FROM access_groups
ORDER BY access_groups.name;

-- name: UpdateAccessGroup :exec
UPDATE access_groups
SET
    name = sqlc.arg(name),
    description = sqlc.arg(description),
    staff_listed = sqlc.arg(staff_listed),
    updated_at = sqlc.arg(updated_at)
WHERE id = sqlc.arg(id);

-- name: ListAccessGroupAttributes :many
SELECT attribute FROM access_group_attributes
WHERE access_group_id = sqlc.arg(access_group_id)
ORDER BY attribute;

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

-- name: GetAccessGroupMember :one
SELECT * FROM access_group_members
WHERE access_group_id = sqlc.arg(access_group_id) AND user_id = sqlc.arg(user_id);

-- name: UpdateAccessGroupMemberDisplay :exec
UPDATE access_group_members
SET display_avatar_id = sqlc.narg(display_avatar_id)
WHERE access_group_id = sqlc.arg(access_group_id) AND user_id = sqlc.arg(user_id);

-- The name is that of the member's display habbo, or of their first habbo.
-- name: ListAccessGroupMembers :many
SELECT
    access_group_members.user_id,
    access_group_members.display_avatar_id,
    CAST(COALESCE((
        SELECT avatars.name FROM avatars
        WHERE avatars.id = access_group_members.display_avatar_id
    ), (
        SELECT avatars.name FROM avatars
        WHERE avatars.user_id = access_group_members.user_id
        ORDER BY avatars.created_at, avatars.id
        LIMIT 1
    ), '') AS TEXT) AS name
FROM access_group_members
WHERE access_group_members.access_group_id = sqlc.arg(access_group_id)
ORDER BY name;

-- Holo's list of staff, one row per membership. The name is chosen as in
-- ListAccessGroupMembers.
-- name: ListStaffMembers :many
SELECT
    access_group_members.user_id,
    access_groups.name AS group_name,
    CAST(COALESCE((
        SELECT avatars.name FROM avatars
        WHERE avatars.id = access_group_members.display_avatar_id
    ), (
        SELECT avatars.name FROM avatars
        WHERE avatars.user_id = access_group_members.user_id
        ORDER BY avatars.created_at, avatars.id
        LIMIT 1
    ), '') AS TEXT) AS name
FROM access_group_members
JOIN access_groups ON access_groups.id = access_group_members.access_group_id
ORDER BY name, group_name
LIMIT sqlc.arg(row_limit);

-- name: ListUserAttributes :many
SELECT DISTINCT access_group_attributes.attribute
FROM access_group_attributes
JOIN access_group_members ON access_group_members.access_group_id = access_group_attributes.access_group_id
WHERE access_group_members.user_id = sqlc.arg(user_id)
UNION
SELECT user_attributes.attribute
FROM user_attributes
WHERE user_attributes.user_id = sqlc.arg(user_id)
ORDER BY attribute;

-- name: AddUserAttribute :exec
INSERT INTO user_attributes (user_id, attribute, granted_at, granted_by_user_id)
VALUES (sqlc.arg(user_id), sqlc.arg(attribute), sqlc.arg(granted_at), sqlc.narg(granted_by_user_id))
ON CONFLICT (user_id, attribute) DO NOTHING;

-- name: RemoveUserAttribute :exec
DELETE FROM user_attributes
WHERE user_id = sqlc.arg(user_id) AND attribute = sqlc.arg(attribute);

-- The name is that of the habbo shown for the user on the staff page, or of their
-- first habbo when no group names one.
-- name: ListAttributeHolderDetails :many
SELECT
    users.id,
    users.email,
    CAST(COALESCE((
        SELECT avatars.name FROM access_group_members
        JOIN avatars ON avatars.id = access_group_members.display_avatar_id
        WHERE access_group_members.user_id = users.id
        ORDER BY access_group_members.access_group_id
        LIMIT 1
    ), (
        SELECT avatars.name FROM avatars
        WHERE avatars.user_id = users.id
        ORDER BY avatars.created_at, avatars.id
        LIMIT 1
    ), '') AS TEXT) AS name
FROM users
WHERE users.id IN (
    SELECT access_group_members.user_id
    FROM access_group_members
    JOIN access_group_attributes ON access_group_attributes.access_group_id = access_group_members.access_group_id
    WHERE access_group_attributes.attribute = sqlc.arg(attribute)
    UNION
    SELECT user_attributes.user_id
    FROM user_attributes
    WHERE user_attributes.attribute = sqlc.arg(attribute)
)
ORDER BY name
LIMIT sqlc.arg(row_limit);

-- name: ListAttributeHolders :many
SELECT DISTINCT access_group_members.user_id
FROM access_group_members
JOIN access_group_attributes ON access_group_attributes.access_group_id = access_group_members.access_group_id
WHERE access_group_attributes.attribute = sqlc.arg(attribute)
UNION
SELECT user_attributes.user_id
FROM user_attributes
WHERE user_attributes.attribute = sqlc.arg(attribute)
ORDER BY user_id;
