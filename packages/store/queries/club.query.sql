-- name: GetClubEnd :one
SELECT ends_at FROM club_subscriptions
WHERE avatar_id = sqlc.arg(avatar_id) AND starts_at <= sqlc.arg(now) AND ends_at > sqlc.arg(now)
ORDER BY ends_at DESC
LIMIT 1;
