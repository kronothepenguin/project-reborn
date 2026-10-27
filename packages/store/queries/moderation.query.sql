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
