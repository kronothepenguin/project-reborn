-- name: GetLoginByHabboName :one
SELECT
    avatars.id AS avatar_id,
    avatars.user_id,
    avatars.name,
    credentials.password_hash
FROM avatars
JOIN credentials ON credentials.user_id = avatars.user_id
WHERE avatars.name = sqlc.arg(name) AND avatars.archived_at IS NULL;

-- name: GetCredential :one
SELECT * FROM credentials WHERE user_id = sqlc.arg(user_id);

-- name: UpsertCredential :exec
INSERT INTO credentials (user_id, password_hash, updated_at)
VALUES (sqlc.arg(user_id), sqlc.arg(password_hash), sqlc.arg(updated_at))
ON CONFLICT (user_id) DO UPDATE SET
    password_hash = excluded.password_hash,
    updated_at = excluded.updated_at;

-- name: CreateSession :exec
INSERT INTO sessions (id, user_id, avatar_id, remember, ip, user_agent, created_at, last_seen_at, expires_at)
VALUES (
    sqlc.arg(id), sqlc.arg(user_id), sqlc.arg(avatar_id), sqlc.arg(remember), sqlc.arg(ip),
    sqlc.arg(user_agent), sqlc.arg(created_at), sqlc.arg(last_seen_at), sqlc.arg(expires_at)
);

-- name: GetActiveSession :one
SELECT * FROM sessions
WHERE id = sqlc.arg(id) AND expires_at > sqlc.arg(now);

-- name: TouchSession :exec
UPDATE sessions
SET last_seen_at = sqlc.arg(last_seen_at), expires_at = sqlc.arg(expires_at)
WHERE id = sqlc.arg(id);

-- Affects no row when the habbo does not belong to the session's user.
-- name: SwitchSessionAvatar :execrows
UPDATE sessions
SET avatar_id = sqlc.arg(avatar_id)
WHERE sessions.id = sqlc.arg(id)
  AND EXISTS (
      SELECT 1 FROM avatars
      WHERE avatars.id = sqlc.arg(avatar_id)
        AND avatars.user_id = sessions.user_id
        AND avatars.archived_at IS NULL
  );

-- name: MoveAvatarSessions :exec
UPDATE sessions SET avatar_id = sqlc.arg(to_avatar_id) WHERE avatar_id = sqlc.arg(avatar_id);

-- name: DeleteSession :exec
DELETE FROM sessions WHERE id = sqlc.arg(id);

-- name: DeleteUserSessions :exec
DELETE FROM sessions WHERE user_id = sqlc.arg(user_id);

-- name: DeleteOtherUserSessions :exec
DELETE FROM sessions WHERE user_id = sqlc.arg(user_id) AND id <> sqlc.arg(keep_id);

-- name: PurgeExpiredSessions :execrows
DELETE FROM sessions WHERE expires_at <= sqlc.arg(now);

-- name: CreateLoginAttempt :exec
INSERT INTO login_attempts (user_id, avatar_id, ip, succeeded, created_at)
VALUES (sqlc.narg(user_id), sqlc.narg(avatar_id), sqlc.arg(ip), sqlc.arg(succeeded), sqlc.arg(created_at));

-- OFFSET 1 skips the newest sign-in, which is the one in use. CAST keeps user_id
-- a non-null parameter although the column is nullable.
-- name: GetPreviousLogin :one
SELECT ip, created_at FROM login_attempts
WHERE user_id = CAST(sqlc.arg(user_id) AS INTEGER) AND succeeded
ORDER BY created_at DESC, id DESC
LIMIT 1 OFFSET 1;

-- name: CountFailedLoginsByIP :one
SELECT COUNT(*) FROM login_attempts
WHERE ip = sqlc.arg(ip) AND NOT succeeded AND created_at >= sqlc.arg(since);

-- CAST keeps user_id a non-null parameter although the column is nullable.
-- name: CountFailedLoginsByUser :one
SELECT COUNT(*) FROM login_attempts
WHERE user_id = CAST(sqlc.arg(user_id) AS INTEGER) AND NOT succeeded AND created_at >= sqlc.arg(since);

-- name: GetLastSignIn :one
SELECT created_at FROM login_attempts
WHERE avatar_id = sqlc.arg(avatar_id) AND succeeded
ORDER BY created_at DESC
LIMIT 1;

-- name: GetLastSeen :one
SELECT last_seen_at FROM sessions
WHERE avatar_id = sqlc.arg(avatar_id)
ORDER BY last_seen_at DESC
LIMIT 1;

-- CAST keeps user_id a non-null parameter although the column is nullable.
-- name: ListUserLogins :many
SELECT ip, created_at FROM login_attempts
WHERE user_id = CAST(sqlc.arg(user_id) AS INTEGER) AND succeeded
ORDER BY created_at DESC, id DESC
LIMIT sqlc.arg(row_limit);

-- name: GetResetAccount :one
SELECT users.id AS user_id, users.email, avatars.name
FROM avatars
JOIN users ON users.id = avatars.user_id
WHERE avatars.name = sqlc.arg(name) AND users.email = sqlc.arg(email) AND avatars.archived_at IS NULL;

-- name: CreatePasswordReset :execrows
INSERT INTO password_resets (id, user_id, created_at, expires_at)
SELECT sqlc.arg(id), sqlc.arg(user_id), sqlc.arg(created_at), sqlc.arg(expires_at)
WHERE (
    SELECT COUNT(*) FROM password_resets AS active
    WHERE active.user_id = sqlc.arg(user_id) AND active.expires_at > sqlc.arg(created_at)
) < sqlc.arg(max_active);

-- name: GetActivePasswordReset :one
SELECT * FROM password_resets
WHERE id = sqlc.arg(id) AND expires_at > sqlc.arg(now);

-- name: DeleteUserPasswordResets :exec
DELETE FROM password_resets WHERE user_id = sqlc.arg(user_id);

-- name: PurgeExpiredPasswordResets :execrows
DELETE FROM password_resets WHERE expires_at <= sqlc.arg(now);
