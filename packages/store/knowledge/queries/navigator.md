---
type: SQL Query
title: navigator.query.sql
description: Navigator operations: the categories, models and public rooms; a habbo's rooms, a category's, a search and random ones; creating, changing and deleting a room; and a habbo's favourite rooms.
resource: packages/store/queries/navigator.query.sql
tags: [store, query, navigator]
timestamp: 2026-11-10T03:49:22+00:00
---

# Operations

## ListRoomCategories

- Cardinality: `:many`
- Inputs: none
- Result: every category, by id
- Tables: `room_categories`

## ListRoomModels

- Cardinality: `:many`
- Inputs: none
- Result: every model, by id
- Tables: `room_models`

## ListPublicRooms

- Cardinality: `:many`
- Inputs: none
- Result: every public room, by id
- Tables: `public_rooms`

## CreateRoom

- Cardinality: `:one`
- Inputs: `avatar_id`, `room_category_id`, `room_model_id`, `name`, `door`, `show_owner`, `created_at`
- Result: the new room, the habbo its creator and its owner, with the other settings at their defaults
- Tables: `rooms`

## GetRoom

- Cardinality: `:one`
- Inputs: `id`
- Result: the room and its owner's name; not found when there is none
- Tables: `rooms`, `avatars`

## CountAvatarRooms

- Cardinality: `:one`
- Inputs: `avatar_id`
- Result: how many rooms the habbo owns
- Tables: `rooms`

## ListAvatarRooms

- Cardinality: `:many`
- Inputs: `avatar_id`
- Result: the habbo's rooms with its name, by id
- Tables: `rooms`, `avatars`

## ListCategoryRooms

- Cardinality: `:many`
- Inputs: `room_category_id`, `max_rooms`
- Result: the category's rooms with their owners' names, by id, at most `max_rooms`
- Tables: `rooms`, `avatars`

## SearchRooms

- Cardinality: `:many`
- Inputs: `owner_name`, `name_pattern`, `max_rooms`
- Result: the rooms whose owner has that name, without case, or whose name is LIKE the pattern, which escapes `%`, `_` and `!` with `!`; by id, at most `max_rooms`
- Tables: `rooms`, `avatars`

## ListRandomRooms

- Cardinality: `:many`
- Inputs: `max_rooms`
- Result: up to `max_rooms` rooms drawn at random, with their owners' names
- Tables: `rooms`, `avatars`

## UpdateRoomInfo

- Cardinality: `:execrows`
- Inputs: `id`, `owner_avatar_id`, `name`, `door`, `show_owner`, `updated_at`
- Result: 1 when the habbo owns the room and it changed, 0 otherwise
- Tables: `rooms`

## UpdateRoomSettings

- Cardinality: `:execrows`
- Inputs: `id`, `owner_avatar_id`, `description`, `others_move_furni`, `max_visitors`, `updated_at`
- Result: as `UpdateRoomInfo`
- Tables: `rooms`

## SetRoomPassword

- Cardinality: `:execrows`
- Inputs: `id`, `owner_avatar_id`, `password_hash`, `updated_at`
- Result: as `UpdateRoomInfo`; the caller hashes the password
- Tables: `rooms`

## SetRoomCategory

- Cardinality: `:execrows`
- Inputs: `id`, `owner_avatar_id`, `room_category_id`, `updated_at`
- Result: as `UpdateRoomInfo`; the caller checks the category
- Tables: `rooms`

## DeleteRoom

- Cardinality: `:execrows`
- Inputs: `id`, `owner_avatar_id`
- Result: 1 when the habbo owned the room, which goes with its favourites
- Tables: `rooms`, `favourite_rooms`

## ListFavouritePublicRooms

- Cardinality: `:many`
- Inputs: `avatar_id`
- Result: the ids of the habbo's favourite public rooms, oldest first
- Tables: `favourite_rooms`

## ListFavouriteRooms

- Cardinality: `:many`
- Inputs: `avatar_id`
- Result: the habbo's favourite habbo rooms with their owners' names, oldest first
- Tables: `favourite_rooms`, `rooms`, `avatars`

## CountFavouriteRooms

- Cardinality: `:one`
- Inputs: `avatar_id`
- Result: how many favourites the habbo keeps, of both kinds
- Tables: `favourite_rooms`

## AddFavouritePublicRoom

- Cardinality: `:exec`
- Inputs: `avatar_id`, `public_room_id`, `created_at`
- Result: the favourite, or nothing when it is one already
- Tables: `favourite_rooms`

## AddFavouriteRoom

- Cardinality: `:exec`
- Inputs: `avatar_id`, `room_id`, `created_at`
- Result: as `AddFavouritePublicRoom`
- Tables: `favourite_rooms`

## RemoveFavouritePublicRoom

- Cardinality: `:exec`
- Inputs: `avatar_id`, `public_room_id`
- Result: the favourite gone
- Tables: `favourite_rooms`

## RemoveFavouriteRoom

- Cardinality: `:exec`
- Inputs: `avatar_id`, `room_id`
- Result: the favourite gone
- Tables: `favourite_rooms`

# Related

- Entities: [Room category](/entities/room-category.md), [Room model](/entities/room-model.md),
  [Public room](/entities/public-room.md), [Room](/entities/room.md) and [Favourite room](/entities/favourite-room.md).
