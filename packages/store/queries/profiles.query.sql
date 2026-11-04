-- name: CreateProfile :one
INSERT INTO profiles (avatar_id, created_at, updated_at)
VALUES (sqlc.arg(avatar_id), sqlc.arg(created_at), sqlc.arg(updated_at))
RETURNING *;

-- name: ListProfileTags :many
SELECT tag FROM profile_tags
WHERE profile_id = sqlc.arg(profile_id)
ORDER BY created_at, tag;

-- name: GetAvatarProfile :one
SELECT * FROM profiles WHERE avatar_id = sqlc.arg(avatar_id);

-- name: CountProfileTags :one
SELECT COUNT(*) FROM profile_tags WHERE profile_id = sqlc.arg(profile_id);

-- name: AddProfileTag :execrows
INSERT INTO profile_tags (profile_id, tag, created_at)
VALUES (sqlc.arg(profile_id), sqlc.arg(tag), sqlc.arg(created_at))
ON CONFLICT (profile_id, tag) DO NOTHING;

-- name: DeleteProfileTag :execrows
DELETE FROM profile_tags WHERE profile_id = sqlc.arg(profile_id) AND tag = sqlc.arg(tag);

-- An archived habbo leaves the lists, and so do its tags, in the cloud, the
-- search and the tag fight alike.
-- name: ListTagCloud :many
SELECT profile_tags.tag, COUNT(*) AS habbos
FROM profile_tags
JOIN profiles ON profiles.id = profile_tags.profile_id
JOIN avatars ON avatars.id = profiles.avatar_id
WHERE avatars.archived_at IS NULL
GROUP BY profile_tags.tag
ORDER BY random()
LIMIT sqlc.arg(row_limit);

-- In the order the habbos took the tag, as Holo listed them.
-- name: ListTaggedAvatars :many
SELECT avatars.id, avatars.name, avatars.figure, avatars.motto, profiles.id AS profile_id
FROM profile_tags
JOIN profiles ON profiles.id = profile_tags.profile_id
JOIN avatars ON avatars.id = profiles.avatar_id
WHERE profile_tags.tag = sqlc.arg(tag) AND avatars.archived_at IS NULL
ORDER BY profile_tags.created_at, profile_tags.profile_id
LIMIT sqlc.arg(row_limit);

-- name: CountTaggedAvatars :one
SELECT COUNT(*)
FROM profile_tags
JOIN profiles ON profiles.id = profile_tags.profile_id
JOIN avatars ON avatars.id = profiles.avatar_id
WHERE profile_tags.tag = sqlc.arg(tag) AND avatars.archived_at IS NULL;
