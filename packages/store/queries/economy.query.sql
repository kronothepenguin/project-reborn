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

-- The guard keeps the wallet from going below zero: no row changed means it would
-- have.
-- name: ChangeWalletCredits :execrows
UPDATE wallets
SET credits = credits + sqlc.arg(credits), updated_at = sqlc.arg(updated_at)
WHERE user_id = sqlc.arg(user_id) AND credits + sqlc.arg(credits) >= 0;

-- Tickets and film have no ledger, which explains credits alone.
-- name: UpdateWalletTicketsAndFilm :exec
UPDATE wallets
SET tickets = sqlc.arg(tickets), film = sqlc.arg(film), updated_at = sqlc.arg(updated_at)
WHERE user_id = sqlc.arg(user_id);

-- name: GetWallet :one
SELECT * FROM wallets WHERE user_id = sqlc.arg(user_id);

-- The ledger of the user, with the habbo that acted when there was one.
-- name: ListWalletTransactions :many
SELECT wallet_transactions.id, wallet_transactions.credits, wallet_transactions.reason, wallet_transactions.detail,
       wallet_transactions.created_at, avatars.name AS habbo
FROM wallet_transactions
LEFT JOIN avatars ON avatars.id = wallet_transactions.avatar_id
WHERE wallet_transactions.user_id = sqlc.arg(user_id)
ORDER BY wallet_transactions.id DESC
LIMIT sqlc.arg(row_limit) OFFSET sqlc.arg(row_offset);

-- name: CountWalletTransactions :one
SELECT COUNT(*) FROM wallet_transactions WHERE user_id = sqlc.arg(user_id);
