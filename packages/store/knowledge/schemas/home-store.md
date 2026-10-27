---
type: SQL Schema File
title: home-store.schema.sql
description: Declares the home store catalogue and the inventory of bought, unplaced items.
resource: packages/store/schema/home-store.schema.sql
tags: [store, schema, homes]
timestamp: 2026-10-27T21:28:26+00:00
---

# Schema

| Structure | Kind | Purpose |
|-----------|------|---------|
| [home_store_categories](/tables/home_store_categories.md) | table | Store categories, some staff-only |
| [home_store_items](/tables/home_store_items.md) | table | Stickers, note packs and backgrounds for sale |
| `idx_home_store_items_home_store_category_id` | index | Items of a category |
| [home_inventory](/tables/home_inventory.md) | table | Bought items a habbo has not placed yet |

Entity: [Home store](/entities/home-store.md).
