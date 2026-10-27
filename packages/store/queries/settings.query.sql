-- name: ListSettings :many
SELECT * FROM settings ORDER BY key;

-- name: UpsertSetting :exec
INSERT INTO settings (key, value, updated_at, updated_by_user_id)
VALUES (sqlc.arg(key), sqlc.arg(value), sqlc.arg(updated_at), sqlc.narg(updated_by_user_id))
ON CONFLICT (key) DO UPDATE SET
    value = excluded.value,
    updated_at = excluded.updated_at,
    updated_by_user_id = excluded.updated_by_user_id;

-- name: DeleteSetting :exec
DELETE FROM settings WHERE key = sqlc.arg(key);
