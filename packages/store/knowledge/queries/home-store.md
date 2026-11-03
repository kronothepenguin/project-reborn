---
type: SQL Query
title: home-store.query.sql
description: Home store operations for the store's categories and items, and their upkeep from housekeeping.
resource: packages/store/queries/home-store.query.sql
tags: [store, query, homes]
timestamp: 2026-11-03T21:53:51+00:00
---

# Operations

## CreateHomeStoreItem

- Cardinality: `:one`
- Inputs: `home_store_category_id`, `kind`, `asset`, `name`, `price`, `quantity`, `enabled`
- Result: the created `HomeStoreItem` (`RETURNING *`)
- Tables: `home_store_items`

## ListHomeStoreCategories

- Cardinality: `:many`
- Result: every category, in the store's order
- Tables: `home_store_categories`

## GetHomeStoreCategory

- Cardinality: `:one`
- Inputs: `id`
- Result: `HomeStoreCategory`; not found for an unknown id
- Tables: `home_store_categories`

## ListEnabledHomeStoreItems

- Cardinality: `:many`
- Inputs: `home_store_category_id`
- Result: the items of the category that are sold, by id
- Tables: `home_store_items`

## ListHomeStoreItems

- Cardinality: `:many`
- Result: every item, sold or not, by category and id, for housekeeping
- Tables: `home_store_items`

## GetHomeStoreItem

- Cardinality: `:one`
- Inputs: `id`
- Result: `HomeStoreItem`, sold or not; not found for an unknown id
- Tables: `home_store_items`

## UpdateHomeStoreItem

- Cardinality: `:exec`
- Inputs: `id`, `home_store_category_id`, `name`, `price`, `quantity`, `enabled`
- Tables: `home_store_items`

# Related

- Entity: [Home store](/entities/home-store.md).
