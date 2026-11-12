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

-- A voucher gives credits, or the furni of furni_definition_id with no credits.
-- name: CreateVoucher :exec
INSERT INTO vouchers (code, credits, furni_definition_id, created_by_user_id, created_at)
VALUES (sqlc.arg(code), sqlc.arg(credits), sqlc.narg(furni_definition_id), sqlc.narg(created_by_user_id), sqlc.arg(created_at));

-- In the order they were made, as Holo's housekeeping listed them, an item voucher with its furni's sprite.
-- name: ListUnusedVouchers :many
SELECT vouchers.code, vouchers.credits, CAST(COALESCE(furni_definitions.sprite, '') AS TEXT) AS sprite
FROM vouchers
LEFT JOIN furni_definitions ON furni_definitions.id = vouchers.furni_definition_id
WHERE vouchers.redeemed_at IS NULL
ORDER BY vouchers.created_at, vouchers.code;

-- A redeemed voucher stays for audit (0063).
-- name: DeleteUnusedVoucher :execrows
DELETE FROM vouchers WHERE code = sqlc.arg(code) AND redeemed_at IS NULL;

-- One statement claims the code, matched ignoring case, so that of two redemptions
-- of one code only the first finds it unused and gets its credits or its furni.
-- name: RedeemVoucher :one
UPDATE vouchers
SET redeemed_by_avatar_id = CAST(sqlc.arg(redeemed_by_avatar_id) AS INTEGER), redeemed_at = sqlc.arg(redeemed_at)
WHERE code = sqlc.arg(code) AND redeemed_at IS NULL
RETURNING credits, furni_definition_id;
