---
type: SQL Query
title: economy.query.sql
description: Wallet operations for creating a habbo's wallet and writing credit ledger rows.
resource: packages/store/queries/economy.query.sql
tags: [store, query, economy]
timestamp: 2026-10-27T21:44:59+00:00
---

# Operations

## CreateWallet

- Cardinality: `:exec`
- Inputs: `avatar_id`, `credits`, `updated_at`
- Tables: `wallets`

## CreateWalletTransaction

- Cardinality: `:exec`
- Inputs: `avatar_id`, `credits` (signed), `reason`, `detail`, `created_at`
- Result: one ledger row; written in the same transaction as the balance change it explains
- Tables: `wallet_transactions`

# Related

- Entity: [Wallet](/entities/wallet.md).
