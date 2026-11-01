---
type: SQL Query
title: economy.query.sql
description: Wallet operations for reading and creating a habbo's wallet, adding credits and writing credit ledger rows.
resource: packages/store/queries/economy.query.sql
tags: [store, query, economy]
timestamp: 2026-10-27T21:44:59+00:00
---

# Operations

## GetWallet

- Cardinality: `:one`
- Inputs: `avatar_id`
- Result: the habbo's wallet
- Tables: `wallets`

## CreateWallet

- Cardinality: `:exec`
- Inputs: `avatar_id`, `credits`, `updated_at`
- Tables: `wallets`

## CreateWalletTransaction

- Cardinality: `:exec`
- Inputs: `avatar_id`, `credits` (signed), `reason`, `detail`, `created_at`
- Result: one ledger row; written in the same transaction as the balance change it explains
- Tables: `wallet_transactions`

## AddWalletCredits

- Cardinality: `:exec`
- Inputs: `avatar_id`, `credits` (positive), `updated_at`
- Result: adds to the balance in one statement; pair it with a ledger row in the same transaction
- Tables: `wallets`

# Related

- Entity: [Wallet](/entities/wallet.md).
