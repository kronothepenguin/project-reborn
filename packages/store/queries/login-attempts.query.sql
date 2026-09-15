-- name: UpsertLoginFailure :exec
INSERT OR REPLACE INTO login_attempts (key, failures, locked_until, updated_at)
SELECT
    sqlc.arg(attempt_key),
    CASE
        WHEN COALESCE((SELECT la.updated_at FROM login_attempts AS la WHERE la.key = sqlc.arg(attempt_key)), 0) < sqlc.arg(window_start) THEN 1
        ELSE COALESCE((SELECT la.failures FROM login_attempts AS la WHERE la.key = sqlc.arg(attempt_key)), 0) + 1
    END,
    CASE
        WHEN COALESCE((SELECT la.updated_at FROM login_attempts AS la WHERE la.key = sqlc.arg(attempt_key)), 0) < sqlc.arg(window_start) THEN 0
        ELSE COALESCE((SELECT la.locked_until FROM login_attempts AS la WHERE la.key = sqlc.arg(attempt_key)), 0)
    END,
    sqlc.arg(now);

-- name: GetLoginAttempt :one
SELECT * FROM login_attempts WHERE key = ?;

-- name: LockLoginAttempt :exec
UPDATE login_attempts SET locked_until = ? WHERE key = ?;

-- name: ClearLoginAttempt :exec
DELETE FROM login_attempts WHERE key = ?;
