---
type: Entity
title: Room
description: A habbo's room, created with the room-o-matic, with its creator, owner, category, model, door and settings.
tags: [store, entity, navigator]
timestamp: 2026-11-10T03:49:03+00:00
---

# Definition

A room a habbo created. Its creator never changes; its owner is a habbo of the same user
(`plans/holo-port/decisions/0057-furni-and-rooms.md`).

# Invariants

- A habbo owns up to `game.maxRoomsPerHabbo` rooms (`plans/server/decisions/0056-own-rooms-follow-holos-rules.md`).
- The password is stored as a hash (`plans/server/decisions/0062-room-passwords-are-hashed.md`).
- Only its owner changes or deletes it.

# Lifecycle

- The game server creates it, changes it at its owner's request, and deletes it with its favourites. Its furni then
  goes to the owner's hand (`plans/server/decisions/0059-a-deleted-rooms-furni-goes-to-its-owner.md`).

# Vocabularies

| `door` | Meaning |
|--------|---------|
| `open` | Anyone enters |
| `closed` | A visitor rings the bell |
| `password` | A visitor types the password |

# Relations

- Created and owned by [habbos](/entities/habbo.md); in a [room category](/entities/room-category.md), on a
  [room model](/entities/room-model.md); may be a [favourite room](/entities/favourite-room.md).

# Tables

- [rooms](/tables/rooms.md)

# Queries

- [navigator.query.sql](/queries/navigator.md)
