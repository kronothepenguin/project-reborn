---
type: SQLite Table
title: home_inventory
description: Bought home store items a user has not placed yet, with their remaining quantity.
resource: packages/store/schema/home-store.schema.sql
tags: [store, table, homes]
timestamp: 2026-11-02T01:44:15+00:00
---

# Schema

| Column | Type | Null | Default | Description | Key / reference |
|--------|------|------|---------|-------------|-----------------|
| `user_id` | INTEGER | no | | Owning user | primary key part, → `users.id` ON DELETE CASCADE |
| `home_store_item_id` | INTEGER | no | | Bought item | primary key part, → `home_store_items.id` |
| `quantity` | INTEGER | no | | Units left to place | CHECK ≥ 0 |

# Keys

- Primary key (`user_id`, `home_store_item_id`).

# Related

- Entity: [Home store](/entities/home-store.md).
