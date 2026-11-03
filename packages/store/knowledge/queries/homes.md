---
type: SQL Query
title: homes.query.sql
description: Home operations for creating a profile's home, reading it, and placing, moving, skinning and removing its items.
resource: packages/store/queries/homes.query.sql
tags: [store, query, homes]
timestamp: 2026-11-03T17:46:46+00:00
---

# Operations

## CreateProfileHome

- Cardinality: `:one`
- Inputs: `profile_id`, `updated_at`
- Result: the created `Home` (`RETURNING *`) with the default background
- Tables: `homes`

`profile_id` is wrapped in `CAST(… AS INTEGER)` so sqlc types it `int64` instead of copying the nullability of
`homes.profile_id`.

## GetProfileHome

- Cardinality: `:one`
- Inputs: `avatar_id`
- Result: the home of the habbo's profile
- Tables: `homes`, `profiles`

## GetHome

- Cardinality: `:one`
- Inputs: `id`
- Result: `Home`; not found for an unknown id
- Tables: `homes`

## GetHomeHabbo

- Cardinality: `:one`
- Inputs: `home_id`
- Result: the habbo whose profile owns the home; not found for a group's home
- Tables: `avatars`, `profiles`, `homes`

## SetHomeBackground

- Cardinality: `:exec`
- Inputs: `id`, `background_home_store_item_id` (NULL for the default), `updated_at`
- Tables: `homes`

## ListHomeItems

- Cardinality: `:many`
- Inputs: `home_id`
- Result: the home's items, lowest in the stack first
- Tables: `home_items`

## CountHomeItems

- Cardinality: `:one`
- Inputs: `home_id`
- Result: how many items the home holds
- Tables: `home_items`

## GetHomeItem

- Cardinality: `:one`
- Inputs: `id`, `home_id`
- Result: the item when it is on that home; not found otherwise
- Tables: `home_items`

## CreateHomeItem

- Cardinality: `:one`
- Inputs: `home_id`, `kind`, `home_store_item_id`, `widget`, `skin`, `body`, `x`, `y`, `z`, `created_by_avatar_id`,
  `created_at`, `updated_at`
- Result: the created `HomeItem` (`RETURNING *`)
- Tables: `home_items`

## MoveHomeItem

- Cardinality: `:execrows`
- Inputs: `id`, `home_id`, `x`, `y`, `z`, `updated_at`
- Result: 1 when the item is on that home, 0 otherwise
- Tables: `home_items`

## SkinHomeItem

- Cardinality: `:execrows`
- Inputs: `id`, `home_id`, `skin`, `updated_at`
- Result: 1 when the item is on that home, 0 otherwise
- Tables: `home_items`

## DeleteHomeItem

- Cardinality: `:execrows`
- Inputs: `id`, `home_id`
- Result: 1 when the item was on that home, 0 otherwise
- Tables: `home_items`

# Related

- Entity: [Home](/entities/home.md).
