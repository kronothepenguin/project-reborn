---
type: SQL Query
title: home-inventory.query.sql
description: Home inventory operations for adding bought items, listing them, and taking them out to place on a home.
resource: packages/store/queries/home-inventory.query.sql
tags: [store, query, homes]
timestamp: 2026-11-03T17:41:25+00:00
---

# Operations

## AddHomeInventory

- Cardinality: `:exec`
- Inputs: `user_id`, `home_store_item_id`, `quantity`
- Result: the user holds `quantity` more of the item, in a new row or the one they had
- Tables: `home_inventory`

## GetHomeInventoryQuantity

- Cardinality: `:one`
- Inputs: `user_id`, `home_store_item_id`
- Result: how many of the item the user holds; not found when they never had it
- Tables: `home_inventory`

## ListHomeInventory

- Cardinality: `:many`
- Inputs: `user_id`
- Result: the items the user holds, with their kind, image, name and quantity, by item
- Tables: `home_inventory`, `home_store_items`

## TakeHomeInventory

- Cardinality: `:execrows`
- Inputs: `user_id`, `home_store_item_id`, `quantity`
- Result: 1 when the user held enough and they were taken, 0 otherwise, so the inventory never goes below zero
- Tables: `home_inventory`

# Related

- Entity: [Home store](/entities/home-store.md).
