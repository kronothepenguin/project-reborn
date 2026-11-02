-- name: CreateWallet :exec
INSERT INTO wallets (user_id, credits, updated_at)
VALUES (sqlc.arg(user_id), sqlc.arg(credits), sqlc.arg(updated_at));

-- name: CreateWalletTransaction :exec
INSERT INTO wallet_transactions (user_id, avatar_id, credits, reason, detail, created_at)
VALUES (
    sqlc.arg(user_id), sqlc.narg(avatar_id), sqlc.arg(credits), sqlc.arg(reason), sqlc.arg(detail),
    sqlc.arg(created_at)
);

-- name: AddWalletCredits :exec
UPDATE wallets
SET credits = credits + sqlc.arg(credits), updated_at = sqlc.arg(updated_at)
WHERE user_id = sqlc.arg(user_id);

-- name: GetWallet :one
SELECT * FROM wallets WHERE user_id = sqlc.arg(user_id);
