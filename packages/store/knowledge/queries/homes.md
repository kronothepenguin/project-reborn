---
type: SQL Query
title: homes.query.sql
description: Home operations for creating a profile's or a group's home, reading it, placing, moving, skinning and removing its items, and returning a home's items to those who placed them.
resource: packages/store/queries/homes.query.sql
tags: [store, query, homes]
timestamp: 2026-11-05T19:25:27+00:00
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

## ListHomeItemsToDraw

- Cardinality: `:many`
- Inputs: `home_id`
- Result: the home's items, lowest in the stack first, each with the art of its store item, blank for a widget
- Tables: `home_items`, `home_store_items`

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


## CreateGroupHome

- Cardinality: `:one`
- Inputs: `group_id`, `updated_at`
- Result: the created `Home` (`RETURNING *`) of the group, with the default background
- Tables: `homes`

`group_id` is wrapped in `CAST(… AS INTEGER)` as `profile_id` is in `CreateProfileHome`.

## GetGroupHome

- Cardinality: `:one`
- Inputs: `group_id`
- Result: the group's home
- Tables: `homes`

## ReturnHomeItemsToPlacers

- Cardinality: `:exec`
- Inputs: `home_id`
- Result: every sticker and note of the home is added, one each, to the inventory of the user whose habbo placed it,
  a note blank as the item it came from; widgets and items without a placer add nothing, and the items stay until
  deleted
- Tables: `home_inventory`, `home_items`, `avatars`

# Related

- Entity: [Home](/entities/home.md).
