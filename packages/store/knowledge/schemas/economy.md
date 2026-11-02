---
type: SQL Schema File
title: economy.schema.sql
description: Declares user wallets, the credit ledger and vouchers.
resource: packages/store/schema/economy.schema.sql
tags: [store, schema, economy]
timestamp: 2026-11-02T01:44:15+00:00
---

# Schema

| Structure | Kind | Purpose |
|-----------|------|---------|
| [wallets](/tables/wallets.md) | table | Credits, tickets and film of a user, never negative |
| [wallet_transactions](/tables/wallet_transactions.md) | table | One ledger row per change of credits |
| `idx_wallet_transactions_user_id_created_at` | index | A user's transaction history |
| [vouchers](/tables/vouchers.md) | table | Credit vouchers and their redemption |

Entity: [Wallet](/entities/wallet.md).
