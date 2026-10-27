---
type: SQL Schema File
title: economy.schema.sql
description: Declares habbo wallets, the credit ledger and vouchers.
resource: packages/store/schema/economy.schema.sql
tags: [store, schema, economy]
timestamp: 2026-10-27T21:28:26+00:00
---

# Schema

| Structure | Kind | Purpose |
|-----------|------|---------|
| [wallets](/tables/wallets.md) | table | Credits, tickets and film of a habbo, never negative |
| [wallet_transactions](/tables/wallet_transactions.md) | table | One ledger row per change of credits |
| `idx_wallet_transactions_avatar_id_created_at` | index | A habbo's transaction history |
| [vouchers](/tables/vouchers.md) | table | Credit vouchers and their redemption |

Entity: [Wallet](/entities/wallet.md).
