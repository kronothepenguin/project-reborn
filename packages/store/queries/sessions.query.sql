-- name: CreateSession :exec
INSERT INTO sessions (
    id,
    user_id,
    created_at,
    last_seen_at,
    idle_expires_at,
    absolute_expires_at,
    remember,
    revoked_at,
    user_agent,
    address
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);

-- name: GetSession :one
SELECT * FROM sessions WHERE id = ?;

-- name: TouchSession :exec
UPDATE sessions SET last_seen_at = ?, idle_expires_at = ? WHERE id = ?;

-- name: RevokeSession :exec
UPDATE sessions SET revoked_at = ? WHERE id = ? AND revoked_at = 0;

-- name: ListUserSessions :many
SELECT * FROM sessions WHERE user_id = ? ORDER BY created_at DESC;

-- name: PurgeSessions :execrows
DELETE FROM sessions
WHERE revoked_at != 0 OR idle_expires_at <= ? OR absolute_expires_at <= ?;
