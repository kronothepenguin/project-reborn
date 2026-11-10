---
type: Entity
title: Public room
description: One of the hotel's public rooms, which the client draws from its casts, in a category of public rooms.
tags: [store, entity, navigator]
timestamp: 2026-11-10T03:49:03+00:00
---

# Definition

A room of the hotel that nobody owns, such as the Welcome Lounge. The client draws it from the casts it names.

# Invariants

- It is in a category of public rooms, on a model.

# Lifecycle

- The update [0010-navigator.sql](/migrations/0010-navigator.md) seeds Holo's 12 public rooms that are not games;
  nothing changes them yet.

# Vocabularies

None.

# Relations

- In a [room category](/entities/room-category.md), on a [room model](/entities/room-model.md); may be a
  [favourite room](/entities/favourite-room.md).

# Tables

- [public_rooms](/tables/public_rooms.md)

# Queries

- [navigator.query.sql](/queries/navigator.md)
