---
type: SQLite Table
title: home_inventory
description: Bought home store items a habbo has not placed yet, with their remaining quantity.
resource: packages/store/schema/home-store.schema.sql
tags: [store, table, homes]
timestamp: 2026-10-27T21:28:26+00:00
---

# Schema

| Column | Type | Null | Default | Description | Key / reference |
|--------|------|------|---------|-------------|-----------------|
| `avatar_id` | INTEGER | no | | Owning habbo | primary key part, → `avatars.id` ON DELETE CASCADE |
| `home_store_item_id` | INTEGER | no | | Bought item | primary key part, → `home_store_items.id` |
| `quantity` | INTEGER | no | | Units left to place | CHECK ≥ 0 |

# Keys

- Primary key (`avatar_id`, `home_store_item_id`).

# Related

- Entity: [Home store](/entities/home-store.md).
