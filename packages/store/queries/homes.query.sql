-- CAST keeps profile_id a non-null parameter although homes.profile_id is nullable.
-- name: CreateProfileHome :one
INSERT INTO homes (profile_id, updated_at)
VALUES (CAST(sqlc.arg(profile_id) AS INTEGER), sqlc.arg(updated_at))
RETURNING *;
