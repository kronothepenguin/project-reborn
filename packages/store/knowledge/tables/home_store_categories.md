---
type: SQLite Table
title: home_store_categories
description: Categories of the home store, ordered by position, some reserved for staff.
resource: packages/store/schema/home-store.schema.sql
tags: [store, table, homes]
timestamp: 2026-10-27T21:28:26+00:00
---

# Schema

| Column | Type | Null | Default | Description | Key / reference |
|--------|------|------|---------|-------------|-----------------|
| `id` | INTEGER | no | rowid | Category id | primary key |
| `name` | TEXT | no | | Display name ("General", "Backgrounds") | |
| `staff_only` | BOOLEAN | no | FALSE | Visible only with `homes.staffItems` | |
| `position` | INTEGER | no | 0 | Display order | |

# Keys

- Primary key `id`.

# Related

- Entity: [Home store](/entities/home-store.md).
- Referenced by [home_store_items](/tables/home_store_items.md).
