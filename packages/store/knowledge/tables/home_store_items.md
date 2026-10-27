---
type: SQLite Table
title: home_store_items
description: Stickers, note packs and backgrounds for sale in the home store.
resource: packages/store/schema/home-store.schema.sql
tags: [store, table, homes]
timestamp: 2026-10-27T21:28:26+00:00
---

# Schema

| Column | Type | Null | Default | Description | Key / reference |
|--------|------|------|---------|-------------|-----------------|
| `id` | INTEGER | no | rowid | Item id | primary key |
| `home_store_category_id` | INTEGER | no | | Category | → `home_store_categories.id` |
| `kind` | TEXT | no | | `sticker`, `note` or `background` | |
| `asset` | TEXT | no | | Asset key of the re-hosted image | |
| `name` | TEXT | no | | Display name | |
| `price` | INTEGER | no | | Price in credits | CHECK ≥ 0 |
| `quantity` | INTEGER | no | 1 | Units granted per purchase | CHECK ≥ 1 |
| `enabled` | BOOLEAN | no | TRUE | For sale | |

Items referenced by homes or inventories cannot be deleted; they are disabled instead.

# Keys

- Primary key `id`.
- `idx_home_store_items_home_store_category_id` (`home_store_category_id`).

# Related

- Entity: [Home store](/entities/home-store.md).
- Referenced by [home_inventory](/tables/home_inventory.md), [home_items](/tables/home_items.md) and
  [homes](/tables/homes.md).
