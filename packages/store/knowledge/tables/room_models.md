---
type: SQLite Table
title: room_models
description: A room's floor plan: its door, its heightmap and a public room's furni, with which models a habbo may build on and which need the club.
resource: packages/store/schema/navigator.schema.sql
tags: [store, table, navigator]
timestamp: 2026-11-10T03:49:03+00:00
---

# Schema

| Column | Type | Null | Default | Description | Key / reference |
|--------|------|------|---------|-------------|-----------------|
| `id` | INTEGER | no | | Model | primary key |
| `name` | TEXT | no | | Name the client knows, such as `a` or `newbie_lobby` | unique |
| `habbo_rooms` | BOOLEAN | no | FALSE | A habbo may build a room on it: the room-o-matic's `a` to `r` | |
| `club_only` | BOOLEAN | no | FALSE | Only for holders of `fuse_use_special_room_layouts` | |
| `door_x`, `door_y` | INTEGER | no | | Where a habbo appears | |
| `door_height` | INTEGER | no | | The door's height | |
| `door_direction` | INTEGER | no | | Where a habbo faces at the door | CHECK 0 to 7 |
| `heightmap` | TEXT | no | | One row of the floor per line | |
| `public_items` | TEXT | no | `''` | A public room's furni, one item per line | |
| `swimming_pool` | BOOLEAN | no | FALSE | The room has a pool | |
| `special_cast` | TEXT | yes | | Holo's special cast emitter, such as `sf` | |
| `special_cast_interval_ms`, `special_cast_min`, `special_cast_max` | INTEGER | yes | | How often it fires, and the range of its random value | |

# Keys

- Primary key `id`; `name` unique.

# Notes

- Holo's carriage returns are line breaks here; the server writes the protocol's separators when it sends a model.
- The club models are those the client's `private.room.properties` marks, `g`, `h` and `o` to `r`: Holo's
  `roomomatic_subscr_only` marks none.

# Related

- Entity: [Room model](/entities/room-model.md).
- Queries: [navigator.query.sql](/queries/navigator.md).
