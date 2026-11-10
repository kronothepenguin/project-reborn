-- The club's end while a period covers now: the end of the user's last period, since a
-- period bought during the club starts where the last one ends.
-- name: GetClubEnd :one
SELECT club_subscriptions.ends_at FROM club_subscriptions
WHERE club_subscriptions.user_id = sqlc.arg(user_id)
  AND EXISTS (
    SELECT 1 FROM club_subscriptions AS running
    WHERE running.user_id = sqlc.arg(user_id) AND running.starts_at <= sqlc.arg(now) AND running.ends_at > sqlc.arg(now)
  )
ORDER BY club_subscriptions.ends_at DESC
LIMIT 1;

-- The end of the user's last period, past or to come; a purchase starts at the later
-- of now and this end.
-- name: GetLatestClubEnd :one
SELECT ends_at FROM club_subscriptions
WHERE user_id = sqlc.arg(user_id)
ORDER BY ends_at DESC
LIMIT 1;

-- name: ListClubSubscriptions :many
SELECT starts_at, ends_at FROM club_subscriptions
WHERE user_id = sqlc.arg(user_id)
ORDER BY starts_at;

-- name: HasClubSubscription :one
SELECT EXISTS (SELECT 1 FROM club_subscriptions WHERE user_id = sqlc.arg(user_id));

-- name: CreateClubSubscription :exec
INSERT INTO club_subscriptions (user_id, starts_at, ends_at, created_at)
VALUES (sqlc.arg(user_id), sqlc.arg(starts_at), sqlc.arg(ends_at), sqlc.arg(created_at));
