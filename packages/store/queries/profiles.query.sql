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
