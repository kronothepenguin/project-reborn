---
type: SQLite Table
title: vouchers
description: Vouchers created by staff, each worth credits or one furni, matched ignoring case, and kept after redemption for audit.
resource: packages/store/schema/economy.schema.sql
tags: [store, table, economy]
timestamp: 2026-11-06T22:56:10+00:00
---

# Schema

| Column | Type | Null | Default | Description | Key / reference |
|--------|------|------|---------|-------------|-----------------|
| `code` | TEXT `COLLATE NOCASE` | no | | Voucher code | primary key, ignoring case |
| `credits` | INTEGER | no | 0 | Credits granted; 0 for an item voucher | CHECK >= 0 |
| `furni_definition_id` | INTEGER | yes | | The furni an item voucher gives; none for a credit voucher | → `furni_definitions.id` |
| `created_by_user_id` | INTEGER | yes | | Staff user who created it | → `users.id` ON DELETE SET NULL |
| `created_at` | DATETIME | no | | Creation time (UTC) | |
| `redeemed_by_avatar_id` | INTEGER | yes | | Habbo that redeemed it | → `avatars.id` ON DELETE SET NULL |
| `redeemed_at` | DATETIME | yes | | Redemption time; NULL while unused | |

# Keys

- Primary key `code`.
- CHECK: credits above 0 or a furni, never both and never neither.

# Related

- Entity: [Voucher](/entities/voucher.md).
- Queries: [economy.query.sql](/queries/economy.md).
