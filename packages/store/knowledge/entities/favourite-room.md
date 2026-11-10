---
type: Entity
title: Favourite room
description: A public room or a habbo room that a habbo keeps among its favourites, up to a limit.
tags: [store, entity, navigator]
timestamp: 2026-11-10T03:49:03+00:00
---

# Definition

A room a habbo keeps in the navigator's favourites.

# Invariants

- It names a public room or a habbo room, never both, and each at most once.
- A habbo keeps up to `game.maxFavouriteRooms` (`plans/server/decisions/0058-favourites-saved-up-to-30.md`).

# Lifecycle

- The habbo adds and removes it; it goes with its room or its habbo.

# Vocabularies

None.

# Relations

- Of a [habbo](/entities/habbo.md); names a [public room](/entities/public-room.md) or a [room](/entities/room.md).

# Tables

- [favourite_rooms](/tables/favourite_rooms.md)

# Queries

- [navigator.query.sql](/queries/navigator.md)
