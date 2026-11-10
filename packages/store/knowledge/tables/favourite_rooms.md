---
type: SQLite Table
title: favourite_rooms
description: A habbo's favourite room: a public room or a habbo room, never both, each at most once.
resource: packages/store/schema/navigator.schema.sql
tags: [store, table, navigator]
timestamp: 2026-11-10T03:49:03+00:00
---

# Schema

| Column | Type | Null | Default | Description | Key / reference |
|--------|------|------|---------|-------------|-----------------|
| `avatar_id` | INTEGER | no | | Habbo | → `avatars.id` ON DELETE CASCADE |
| `public_room_id` | INTEGER | yes | | Public room | → `public_rooms.id` ON DELETE CASCADE |
| `room_id` | INTEGER | yes | | Habbo room | → `rooms.id` ON DELETE CASCADE |
| `created_at` | DATETIME | no | | When it became a favourite (UTC) | |

# Keys

- CHECK exactly one of `public_room_id` and `room_id` is set.
- `idx_favourite_rooms_avatar_id_public_room_id` UNIQUE (`avatar_id`, `public_room_id`) and
  `idx_favourite_rooms_avatar_id_room_id` UNIQUE (`avatar_id`, `room_id`): a room is a habbo's favourite once.

# Related

- Entity: [Favourite room](/entities/favourite-room.md).
- Queries: [navigator.query.sql](/queries/navigator.md).
