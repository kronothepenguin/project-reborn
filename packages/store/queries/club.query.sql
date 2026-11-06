-- name: GetClubEnd :one
SELECT ends_at FROM club_subscriptions
WHERE user_id = sqlc.arg(user_id) AND starts_at <= sqlc.arg(now) AND ends_at > sqlc.arg(now)
ORDER BY ends_at DESC
LIMIT 1;

-- The end of the user's last period, past or to come; a purchase starts at the later
-- of now and this end.
-- name: GetLatestClubEnd :one
SELECT ends_at FROM club_subscriptions
WHERE user_id = sqlc.arg(user_id)
ORDER BY ends_at DESC
LIMIT 1;

-- name: HasClubSubscription :one
SELECT EXISTS (SELECT 1 FROM club_subscriptions WHERE user_id = sqlc.arg(user_id));

-- name: CreateClubSubscription :exec
INSERT INTO club_subscriptions (user_id, starts_at, ends_at, created_at)
VALUES (sqlc.arg(user_id), sqlc.arg(starts_at), sqlc.arg(ends_at), sqlc.arg(created_at));
