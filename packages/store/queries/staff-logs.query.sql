-- name: CreateStaffLog :exec
INSERT INTO staff_logs (user_id, target_user_id, target_avatar_id, action, detail, ip, created_at)
VALUES (
    sqlc.narg(user_id), sqlc.narg(target_user_id), sqlc.narg(target_avatar_id), sqlc.arg(action),
    sqlc.arg(detail), sqlc.arg(ip), sqlc.arg(created_at)
);

-- name: CountStaffLogs :one
SELECT COUNT(*) FROM staff_logs;

-- A user has no name of their own, so the names are those of the first habbo, or
-- of the target habbo when the row has one. A name is empty once the user or the
-- habbo is gone.
-- name: ListStaffLogs :many
SELECT
    staff_logs.id,
    staff_logs.user_id,
    staff_logs.target_user_id,
    staff_logs.target_avatar_id,
    staff_logs.action,
    staff_logs.detail,
    staff_logs.ip,
    staff_logs.created_at,
    CAST(COALESCE((
        SELECT avatars.name FROM avatars
        WHERE avatars.user_id = staff_logs.user_id
        ORDER BY avatars.created_at, avatars.id
        LIMIT 1
    ), '') AS TEXT) AS user_name,
    CAST(COALESCE((
        SELECT avatars.name FROM avatars
        WHERE avatars.id = staff_logs.target_avatar_id
           OR (staff_logs.target_avatar_id IS NULL AND avatars.user_id = staff_logs.target_user_id)
        ORDER BY avatars.created_at, avatars.id
        LIMIT 1
    ), '') AS TEXT) AS target_name
FROM staff_logs
ORDER BY staff_logs.id DESC
LIMIT sqlc.arg(row_limit) OFFSET sqlc.arg(row_offset);
