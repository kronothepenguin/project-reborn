-- created_at comes first so sqlc types now as a non-null parameter.
-- name: CountActiveBans :one
SELECT COUNT(*) FROM bans
WHERE created_at <= sqlc.arg(now)
  AND lifted_at IS NULL
  AND (expires_at IS NULL OR expires_at > sqlc.arg(now));

-- The strongest active ban on the user or the IP: permanent first, then the
-- latest expiry. user_id is NULL when a login names an unknown habbo. The
-- CAST and the created_at comparison come first so sqlc types ip and now as
-- non-null parameters instead of copying the nullability of bans.ip and
-- bans.expires_at.
-- name: GetActiveBan :one
SELECT * FROM bans
WHERE created_at <= sqlc.arg(now)
  AND (user_id = sqlc.narg(user_id) OR ip = CAST(sqlc.arg(ip) AS TEXT))
  AND lifted_at IS NULL
  AND (expires_at IS NULL OR expires_at > sqlc.arg(now))
ORDER BY expires_at IS NULL DESC, expires_at DESC
LIMIT 1;

-- name: GetOldestAlert :one
SELECT * FROM alerts
WHERE avatar_id = sqlc.arg(avatar_id) AND dismissed_at IS NULL
ORDER BY id
LIMIT 1;

-- name: DismissAlert :execrows
UPDATE alerts SET dismissed_at = sqlc.arg(dismissed_at)
WHERE id = sqlc.arg(id) AND avatar_id = sqlc.arg(avatar_id) AND dismissed_at IS NULL;

-- name: CountOpenHelpTickets :one
SELECT COUNT(*) FROM help_tickets WHERE picked_up_at IS NULL AND closed_at IS NULL;
