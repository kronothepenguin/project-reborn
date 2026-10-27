---
type: SQLite Table
title: wallets
description: The credits, tickets and film of a habbo, which can never go negative.
resource: packages/store/schema/economy.schema.sql
tags: [store, table, economy]
timestamp: 2026-10-27T21:28:26+00:00
---

# Schema

| Column | Type | Null | Default | Description | Key / reference |
|--------|------|------|---------|-------------|-----------------|
| `avatar_id` | INTEGER | no | | Owning habbo | primary key, → `avatars.id` ON DELETE CASCADE |
| `credits` | INTEGER | no | 0 | Credits | CHECK ≥ 0 |
| `tickets` | INTEGER | no | 0 | Game tickets | CHECK ≥ 0 |
| `film` | INTEGER | no | 0 | Camera film | CHECK ≥ 0 |
| `updated_at` | DATETIME | no | | Last balance change (UTC) | |

# Keys

- Primary key `avatar_id`.

# Related

- Entity: [Wallet](/entities/wallet.md).
