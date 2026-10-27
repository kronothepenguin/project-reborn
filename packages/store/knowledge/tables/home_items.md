---
type: SQLite Table
title: home_items
description: Stickers, sticky notes and widgets placed on a home, with position, stacking order and skin.
resource: packages/store/schema/homes.schema.sql
tags: [store, table, homes]
timestamp: 2026-10-27T21:28:26+00:00
---

# Schema

| Column | Type | Null | Default | Description | Key / reference |
|--------|------|------|---------|-------------|-----------------|
| `id` | INTEGER | no | rowid | Item id | primary key |
| `home_id` | INTEGER | no | | Home the item is on | → `homes.id` ON DELETE CASCADE |
| `kind` | TEXT | no | | `sticker`, `note` or `widget` | |
| `home_store_item_id` | INTEGER | yes | | Sticker's catalogue item; NULL for notes and widgets | → `home_store_items.id` |
| `widget` | TEXT | yes | | Widget type for `kind = 'widget'` | |
| `skin` | TEXT | no | `''` | Skin of a note or widget | |
| `body` | TEXT | no | `''` | Note text in BBCode | |
| `x` | INTEGER | no | | Left position in pixels | |
| `y` | INTEGER | no | | Top position in pixels | |
| `z` | INTEGER | no | | Stacking order | |
| `created_by_avatar_id` | INTEGER | yes | | Habbo that placed the item | → `avatars.id` ON DELETE SET NULL |
| `created_at` | DATETIME | no | | Placement time (UTC) | |
| `updated_at` | DATETIME | no | | Last move or edit (UTC) | |

# Keys

- Primary key `id`.
- `idx_home_items_home_id` (`home_id`).

# Related

- Entity: [Home](/entities/home.md) (allowed `kind`, `widget` and `skin` values are listed there).
