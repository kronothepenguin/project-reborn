-- name: CountGroups :one
SELECT COUNT(*) FROM groups;

-- name: CountGroupsOwnedBy :one
SELECT COUNT(*) FROM groups WHERE avatar_id = sqlc.arg(avatar_id);

-- name: CreateGroup :one
INSERT INTO groups (avatar_id, name, description, badge, access, created_at, updated_at)
VALUES (
    sqlc.arg(avatar_id), sqlc.arg(name), sqlc.arg(description), sqlc.arg(badge), sqlc.arg(access),
    sqlc.arg(created_at), sqlc.arg(updated_at)
)
RETURNING *;

-- name: GetGroup :one
SELECT * FROM groups WHERE id = sqlc.arg(id);

-- Names are unique ignoring case, so a name finds at most one group.
-- name: GetGroupByName :one
SELECT * FROM groups WHERE name = sqlc.arg(name);

-- The habbos of one user share the limit of owned groups (0082).
-- name: CountUserOwnedGroups :one
SELECT COUNT(*) FROM groups
JOIN avatars ON avatars.id = groups.avatar_id
WHERE avatars.user_id = sqlc.arg(user_id);

-- Waiting requests count beside memberships, as Holo counted them (0082).
-- name: CountAvatarMemberships :one
SELECT COUNT(*) FROM group_members WHERE avatar_id = sqlc.arg(avatar_id);

-- name: CountGroupMembers :one
SELECT COUNT(*) FROM group_members
JOIN avatars ON avatars.id = group_members.avatar_id
WHERE group_members.group_id = sqlc.arg(group_id) AND group_members.joined_at IS NOT NULL
  AND avatars.archived_at IS NULL;

-- name: CountGroupRequests :one
SELECT COUNT(*) FROM group_members
JOIN avatars ON avatars.id = group_members.avatar_id
WHERE group_members.group_id = sqlc.arg(group_id) AND group_members.joined_at IS NULL
  AND avatars.archived_at IS NULL;

-- name: GetGroupMember :one
SELECT * FROM group_members WHERE group_id = sqlc.arg(group_id) AND avatar_id = sqlc.arg(avatar_id);

-- Without joined_at the row is a waiting request.
-- name: AddGroupMember :exec
INSERT INTO group_members (group_id, avatar_id, role, requested_at, joined_at)
VALUES (sqlc.arg(group_id), sqlc.arg(avatar_id), sqlc.arg(role), sqlc.arg(requested_at), sqlc.narg(joined_at));

-- The owner never leaves, so a group always keeps its owner's admin row.
-- name: LeaveGroup :execrows
DELETE FROM group_members
WHERE group_members.group_id = sqlc.arg(group_id) AND group_members.avatar_id = sqlc.arg(avatar_id)
  AND group_members.avatar_id <> (SELECT groups.avatar_id FROM groups WHERE groups.id = group_members.group_id);

-- A habbo has one favourite, so the old one goes before another is set.
-- name: ClearFavouriteGroup :exec
UPDATE group_members SET favourite = FALSE WHERE avatar_id = sqlc.arg(avatar_id) AND favourite;

-- name: SetFavouriteGroup :execrows
UPDATE group_members SET favourite = TRUE
WHERE group_id = sqlc.arg(group_id) AND avatar_id = sqlc.arg(avatar_id) AND joined_at IS NOT NULL;

-- name: UnfavouriteGroup :execrows
UPDATE group_members SET favourite = FALSE
WHERE group_id = sqlc.arg(group_id) AND avatar_id = sqlc.arg(avatar_id) AND favourite;

-- Accepting and declining touch only waiting requests.
-- name: AcceptGroupRequest :execrows
UPDATE group_members SET joined_at = sqlc.arg(joined_at)
WHERE group_id = sqlc.arg(group_id) AND avatar_id = sqlc.arg(avatar_id) AND joined_at IS NULL;

-- name: DeclineGroupRequest :execrows
DELETE FROM group_members
WHERE group_id = sqlc.arg(group_id) AND avatar_id = sqlc.arg(avatar_id) AND joined_at IS NULL;

-- Roles change only for members, and never the owner's.
-- name: SetGroupMemberRole :execrows
UPDATE group_members SET role = sqlc.arg(role)
WHERE group_members.group_id = sqlc.arg(group_id) AND group_members.avatar_id = sqlc.arg(avatar_id)
  AND group_members.joined_at IS NOT NULL
  AND group_members.avatar_id <> (SELECT groups.avatar_id FROM groups WHERE groups.id = group_members.group_id);

-- name: RemoveGroupMember :execrows
DELETE FROM group_members
WHERE group_members.group_id = sqlc.arg(group_id) AND group_members.avatar_id = sqlc.arg(avatar_id)
  AND group_members.joined_at IS NOT NULL
  AND group_members.avatar_id <> (SELECT groups.avatar_id FROM groups WHERE groups.id = group_members.group_id);

-- Admins come first, then members, each in the order Holo kept their rows: when
-- they asked to join. The owner bought the group, so its row is the first.
-- name: ListGroupMembers :many
SELECT avatars.id, avatars.name, avatars.figure, avatars.created_at, group_members.role, group_members.favourite
FROM group_members
JOIN avatars ON avatars.id = group_members.avatar_id
WHERE group_members.group_id = sqlc.arg(group_id) AND group_members.joined_at IS NOT NULL
  AND avatars.archived_at IS NULL
ORDER BY group_members.role = 'admin' DESC, group_members.requested_at, avatars.id
LIMIT sqlc.arg(row_limit) OFFSET sqlc.arg(row_offset);

-- name: ListGroupRequests :many
SELECT avatars.id, avatars.name, group_members.requested_at
FROM group_members
JOIN avatars ON avatars.id = group_members.avatar_id
WHERE group_members.group_id = sqlc.arg(group_id) AND group_members.joined_at IS NULL
  AND avatars.archived_at IS NULL
ORDER BY group_members.requested_at, avatars.id
LIMIT sqlc.arg(row_limit) OFFSET sqlc.arg(row_offset);

-- The groups a habbo has joined, in the order it asked to join them.
-- name: ListAvatarGroups :many
SELECT groups.id, groups.name, groups.badge, groups.created_at, groups.avatar_id AS owner_avatar_id,
       group_members.role, group_members.favourite
FROM group_members
JOIN groups ON groups.id = group_members.group_id
WHERE group_members.avatar_id = sqlc.arg(avatar_id) AND group_members.joined_at IS NOT NULL
ORDER BY group_members.requested_at, groups.id;

-- name: GetFavouriteGroup :one
SELECT groups.id, groups.name, groups.badge FROM group_members
JOIN groups ON groups.id = group_members.group_id
WHERE group_members.avatar_id = sqlc.arg(avatar_id) AND group_members.favourite;

-- name: ListRandomGroups :many
SELECT * FROM groups ORDER BY RANDOM() LIMIT sqlc.arg(count);

-- name: UpdateGroup :exec
UPDATE groups
SET name = sqlc.arg(name), description = sqlc.arg(description), access = sqlc.arg(access),
    updated_at = sqlc.arg(updated_at)
WHERE id = sqlc.arg(id);

-- name: DeleteGroupRequests :exec
DELETE FROM group_members WHERE group_id = sqlc.arg(group_id) AND joined_at IS NULL;

-- name: SetGroupBadge :exec
UPDATE groups SET badge = sqlc.arg(badge), updated_at = sqlc.arg(updated_at) WHERE id = sqlc.arg(id);

-- Its memberships and its home go with it.
-- name: DeleteGroup :execrows
DELETE FROM groups WHERE id = sqlc.arg(id);
