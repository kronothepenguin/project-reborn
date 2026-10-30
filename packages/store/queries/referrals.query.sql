-- CAST keeps referrer_avatar_id a non-null parameter although the column is
-- nullable: a new referral always names a habbo.
-- name: CreateReferral :exec
INSERT INTO referrals (referred_user_id, referrer_avatar_id, created_at, rewarded_at)
VALUES (
    sqlc.arg(referred_user_id), CAST(sqlc.arg(referrer_avatar_id) AS INTEGER),
    sqlc.arg(created_at), sqlc.narg(rewarded_at)
);
