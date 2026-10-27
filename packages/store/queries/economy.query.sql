-- name: CreateWallet :exec
INSERT INTO wallets (avatar_id, credits, updated_at)
VALUES (sqlc.arg(avatar_id), sqlc.arg(credits), sqlc.arg(updated_at));

-- name: CreateWalletTransaction :exec
INSERT INTO wallet_transactions (avatar_id, credits, reason, detail, created_at)
VALUES (sqlc.arg(avatar_id), sqlc.arg(credits), sqlc.arg(reason), sqlc.arg(detail), sqlc.arg(created_at));
