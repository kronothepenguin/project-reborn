---
type: SQL Query
title: economy.query.sql
description: Wallet operations for reading and creating a user's wallet, adding credits and writing credit ledger rows, and voucher operations from creating to redeeming once.
resource: packages/store/queries/economy.query.sql
tags: [store, query, economy]
timestamp: 2026-11-06T22:56:10+00:00
---

# Operations

## ChangeWalletCredits

- Cardinality: `:execrows`
- Inputs: `user_id`, `credits` (signed), `updated_at`
- Result: 1 when the change applied, and 0 when it would take the wallet below zero
- Tables: `wallets`

## UpdateWalletTicketsAndFilm

- Cardinality: `:exec`
- Inputs: `user_id`, `tickets`, `film`, `updated_at`
- Tables: `wallets`

## ListWalletTransactions

- Cardinality: `:many`
- Inputs: `user_id`, `row_limit`, `row_offset`
- Result: the ledger of the user, newest first, with the name of the habbo that acted when there was one
- Tables: `wallet_transactions`, `avatars`

## CountWalletTransactions

- Cardinality: `:one`
- Inputs: `user_id`
- Result: how many ledger rows the user has
- Tables: `wallet_transactions`

## GetWallet

- Cardinality: `:one`
- Inputs: `user_id`
- Result: the user's wallet
- Tables: `wallets`

## CreateWallet

- Cardinality: `:exec`
- Inputs: `user_id`, `credits`, `updated_at`
- Tables: `wallets`

## CreateWalletTransaction

- Cardinality: `:exec`
- Inputs: `user_id`, `avatar_id` (nullable), `credits` (signed), `reason`, `detail`, `created_at`
- Result: one ledger row; written in the same transaction as the balance change it explains
- Tables: `wallet_transactions`

## AddWalletCredits

- Cardinality: `:exec`
- Inputs: `user_id`, `credits` (positive), `updated_at`
- Result: adds to the balance in one statement; pair it with a ledger row in the same transaction
- Tables: `wallets`

## CreateVoucher

- Cardinality: `:exec`
- Inputs: `code`, `credits`, `furni_definition_id` (nullable), `created_by_user_id` (nullable), `created_at`
- Result: a voucher of credits, or of a furni with 0 credits; a conflict when a voucher has the code, ignoring case
- Tables: `vouchers`

## ListUnusedVouchers

- Cardinality: `:many`
- Inputs: none
- Result: the code and the credits of the vouchers not redeemed yet, in the order they were made (`ORDER BY
  created_at, code`), as Holo's housekeeping listed them, each item voucher with its furni's sprite
- Tables: `vouchers`, `furni_definitions`

## DeleteUnusedVoucher

- Cardinality: `:execrows`
- Inputs: `code` (matched ignoring case)
- Result: 1 when the voucher was unused and is gone, and 0 when it is redeemed, which stays (0063), or unknown
- Tables: `vouchers`

## RedeemVoucher

- Cardinality: `:one`
- Inputs: `redeemed_by_avatar_id`, `redeemed_at`, `code` (matched ignoring case)
- Result: the voucher's credits and its furni definition, claimed for the habbo in one statement; not found when no
  unused voucher has the code, so of two redemptions of one code only the first gets them. Add the credits to the
  wallet, or create the furni, with a ledger row in the same transaction.
- Tables: `vouchers`

# Related

- Entities: [Wallet](/entities/wallet.md), [Voucher](/entities/voucher.md).
