-- name: GetClubEnd :one
SELECT ends_at FROM club_subscriptions
WHERE user_id = sqlc.arg(user_id) AND starts_at <= sqlc.arg(now) AND ends_at > sqlc.arg(now)
ORDER BY ends_at DESC
LIMIT 1;
