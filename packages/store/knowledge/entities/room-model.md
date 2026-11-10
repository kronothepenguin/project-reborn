---
type: Entity
title: Room model
description: A room's floor plan: its door, heightmap and, for a public room, its furni; some are the models habbos build on, some need the club.
tags: [store, entity, navigator]
timestamp: 2026-11-10T03:49:03+00:00
---

# Definition

The floor plan a room is built on: where a habbo appears, the floor's heights, and a public room's fixed furni.

# Invariants

- Its name is unique.
- A habbo builds a room only on a model of `habbo_rooms`, and on one that is `club_only` only with
  `fuse_use_special_room_layouts`.

# Lifecycle

- The update [0010-navigator.sql](/migrations/0010-navigator.md) seeds Holo's 42 models; nothing changes them yet.

# Vocabularies

None.

# Relations

- [Public rooms](/entities/public-room.md) and [rooms](/entities/room.md) are built on one.

# Tables

- [room_models](/tables/room_models.md)

# Queries

- [navigator.query.sql](/queries/navigator.md)
