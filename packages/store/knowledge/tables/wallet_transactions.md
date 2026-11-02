---
type: SQLite Table
title: wallet_transactions
description: The credit ledger, with one signed row per change of a user's credits.
resource: packages/store/schema/economy.schema.sql
tags: [store, table, economy]
timestamp: 2026-11-02T01:44:15+00:00
---

# Schema

| Column | Type | Null | Default | Description | Key / reference |
|--------|------|------|---------|-------------|-----------------|
| `id` | INTEGER | no | rowid | Transaction id | primary key |
| `user_id` | INTEGER | no | | User whose credits changed | → `users.id` ON DELETE CASCADE |
| `avatar_id` | INTEGER | yes | | Habbo that acted, NULL when none did | → `avatars.id` ON DELETE SET NULL |
| `credits` | INTEGER | no | | Signed change (`-20`, `500`) | |
| `reason` | TEXT | no | | Why the credits changed | |
| `detail` | TEXT | no | `''` | Free detail (item, voucher, months) | |
| `created_at` | DATETIME | no | | Change time (UTC) | |

# Keys

- Primary key `id`.
- `idx_wallet_transactions_user_id_created_at` (`user_id`, `created_at`).

# Related

- Entity: [Wallet](/entities/wallet.md) (allowed `reason` values are listed there).
- Queries: [economy.query.sql](/queries/economy.md).
