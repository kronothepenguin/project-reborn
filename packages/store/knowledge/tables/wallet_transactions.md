---
type: SQLite Table
title: wallet_transactions
description: The credit ledger, with one signed row per change of a habbo's credits.
resource: packages/store/schema/economy.schema.sql
tags: [store, table, economy]
timestamp: 2026-10-27T21:28:26+00:00
---

# Schema

| Column | Type | Null | Default | Description | Key / reference |
|--------|------|------|---------|-------------|-----------------|
| `id` | INTEGER | no | rowid | Transaction id | primary key |
| `avatar_id` | INTEGER | no | | Habbo whose credits changed | → `avatars.id` ON DELETE CASCADE |
| `credits` | INTEGER | no | | Signed change (`-20`, `500`) | |
| `reason` | TEXT | no | | Why the credits changed | |
| `detail` | TEXT | no | `''` | Free detail (item, voucher, months) | |
| `created_at` | DATETIME | no | | Change time (UTC) | |

# Keys

- Primary key `id`.
- `idx_wallet_transactions_avatar_id_created_at` (`avatar_id`, `created_at`).

# Related

- Entity: [Wallet](/entities/wallet.md) (allowed `reason` values are listed there).
- Queries: [economy.query.sql](/queries/economy.md).
