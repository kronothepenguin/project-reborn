---
type: SQLite Table
title: vouchers
description: Credit vouchers created by staff, matched ignoring case, and kept after redemption for audit.
resource: packages/store/schema/economy.schema.sql
tags: [store, table, economy]
timestamp: 2026-10-27T21:28:26+00:00
---

# Schema

| Column | Type | Null | Default | Description | Key / reference |
|--------|------|------|---------|-------------|-----------------|
| `code` | TEXT `COLLATE NOCASE` | no | | Voucher code | primary key, ignoring case |
| `credits` | INTEGER | no | | Credits granted | CHECK > 0 |
| `created_by_user_id` | INTEGER | yes | | Staff user who created it | → `users.id` ON DELETE SET NULL |
| `created_at` | DATETIME | no | | Creation time (UTC) | |
| `redeemed_by_avatar_id` | INTEGER | yes | | Habbo that redeemed it | → `avatars.id` ON DELETE SET NULL |
| `redeemed_at` | DATETIME | yes | | Redemption time; NULL while unused | |

# Keys

- Primary key `code`.

# Related

- Entity: [Wallet](/entities/wallet.md).
