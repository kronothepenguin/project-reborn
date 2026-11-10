---
type: SQL Schema File
title: navigator.schema.sql
description: Declares the navigator: its categories, the room models, the public rooms, the habbos' rooms and their favourite rooms.
resource: packages/store/schema/navigator.schema.sql
tags: [store, schema, navigator]
timestamp: 2026-11-10T03:49:03+00:00
---

# Schema

| Structure | Kind | Purpose |
|-----------|------|---------|
| [room_categories](/tables/room_categories.md) | table | The navigator's categories, of public rooms or of habbo rooms |
| `idx_room_categories_parent_id` | index | A category's sub-categories |
| [room_models](/tables/room_models.md) | table | Floor plans: door, heightmap and public furni |
| [public_rooms](/tables/public_rooms.md) | table | The hotel's public rooms |
| `idx_public_rooms_room_category_id` | index | A category's public rooms |
| [rooms](/tables/rooms.md) | table | The habbos' rooms |
| `idx_rooms_owner_avatar_id` | index | A habbo's own rooms |
| `idx_rooms_room_category_id` | index | A category's habbo rooms |
| [favourite_rooms](/tables/favourite_rooms.md) | table | A habbo's favourite public rooms and habbo rooms |
| `idx_favourite_rooms_avatar_id_public_room_id` | unique index | A public room is a habbo's favourite once |
| `idx_favourite_rooms_avatar_id_room_id` | unique index | A habbo room is a habbo's favourite once |

Entities: [Room category](/entities/room-category.md), [Room model](/entities/room-model.md),
[Public room](/entities/public-room.md), [Room](/entities/room.md) and [Favourite room](/entities/favourite-room.md).
