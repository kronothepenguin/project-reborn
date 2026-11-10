---
type: SQLite Table
title: room_categories
description: A category of the navigator, which holds either public rooms or habbo rooms, with the level a habbo needs to use it.
resource: packages/store/schema/navigator.schema.sql
tags: [store, table, navigator]
timestamp: 2026-11-10T03:49:03+00:00
---

# Schema

| Column | Type | Null | Default | Description | Key / reference |
|--------|------|------|---------|-------------|-----------------|
| `id` | INTEGER | no | | Category, never 0: the client ends a list of nodes at an id of 0 | primary key |
| `parent_id` | INTEGER | yes | | The category above it; none for a root | → `room_categories.id` |
| `kind` | TEXT | no | | `public` for public rooms, `rooms` for habbo rooms | CHECK closed set |
| `name` | TEXT | no | | Name the navigator shows | |
| `min_level` | INTEGER | no | 0 | Access group level a habbo needs to put a room in it | CHECK ≥ 0 |
| `hidden_below_level` | BOOLEAN | no | FALSE | Shown only to habbos of `min_level` and above | |
| `trading` | BOOLEAN | no | FALSE | Trading allowed in its rooms | |

# Keys

- Primary key `id`; `idx_room_categories_parent_id` (`parent_id`).

# Notes

- The update [0010-navigator.sql](/migrations/0010-navigator.md) seeds Holo's English categories, the roots Public
  Rooms (3) and Guestrooms (4), whose ids the client's external variables name.

# Related

- Entity: [Room category](/entities/room-category.md).
- Queries: [navigator.query.sql](/queries/navigator.md).
