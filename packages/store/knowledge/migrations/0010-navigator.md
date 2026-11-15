---
type: SQL Update
title: 0010-navigator.sql
description: Creates the navigator's tables, and seeds Holo's English categories, its 12 public rooms that are not games and its 42 room models.
resource: packages/store/migrations/0010-navigator.sql
tags: [store, update, navigator]
timestamp: 2026-11-10T03:49:03+00:00
---

# Update

| | |
|---|---|
| Title | The navigator's categories, room models, public rooms, habbo rooms and favourite rooms, with Holo's categories, public rooms and room models. |
| Automatic | no |

Creates [room_categories](/tables/room_categories.md), [room_models](/tables/room_models.md),
[public_rooms](/tables/public_rooms.md), [rooms](/tables/rooms.md) and [favourite_rooms](/tables/favourite_rooms.md),
and seeds, with fixed ids, what a new hotel's navigator shows (`knowledge/decisions/server/0055-holos-navigator-set.md`):

- the 15 categories of `source/holoemu/Resources/holodb.sql` that are not BattleBall or SnowStorm, with English names:
  Holo's rank 1 is level 0, and "No category" takes the id 2 for Holo's 0 and sits under Guestrooms;
- the 42 models of `source/holoemu/holodb.sql`, with a line per heightmap row and per public furni item, and the club
  models of the client's `private.room.properties`;
- the 12 public rooms of `source/holoemu/holodb.sql` that are not games, with their ids, 101 to 112.

The update holds the data itself, read once from the dumps; nothing reads them when a program runs.
