---
type: SQLite Table
title: homes
description: A home page owned by exactly one profile or one group, with its background.
resource: packages/store/schema/homes.schema.sql
tags: [store, table, homes]
timestamp: 2026-10-27T21:28:26+00:00
---

# Schema

| Column | Type | Null | Default | Description | Key / reference |
|--------|------|------|---------|-------------|-----------------|
| `id` | INTEGER | no | rowid | Home id | primary key |
| `profile_id` | INTEGER | yes | | Owning profile (habbo home) | unique, → `profiles.id` ON DELETE CASCADE |
| `group_id` | INTEGER | yes | | Owning group (group home) | unique, → `groups.id` ON DELETE CASCADE |
| `background_home_store_item_id` | INTEGER | yes | | Background item; NULL is the default background | → `home_store_items.id` |
| `updated_at` | DATETIME | no | | Last save (UTC) | |

CHECK: exactly one of `profile_id` and `group_id` is set.

# Keys

- Primary key `id`.
- `idx_homes_profile_id` UNIQUE (`profile_id`), `idx_homes_group_id` UNIQUE (`group_id`).

# Related

- Entity: [Home](/entities/home.md).
- Referenced by [home_items](/tables/home_items.md).
