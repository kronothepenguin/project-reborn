---
type: SQL Query
title: economy.query.sql
description: Wallet operations for reading and creating a user's wallet, adding credits and writing credit ledger rows.
resource: packages/store/queries/economy.query.sql
tags: [store, query, economy]
timestamp: 2026-11-02T01:44:15+00:00
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

# Related

- Entity: [Wallet](/entities/wallet.md).
