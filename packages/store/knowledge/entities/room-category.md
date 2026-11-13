---
type: Entity
title: Room category
description: A category of the navigator's tree, holding public rooms or habbo rooms, that a habbo's access group level may need to use.
tags: [store, entity, navigator]
timestamp: 2026-11-10T03:49:03+00:00
---

# Definition

The navigator is a tree of categories. A category holds public rooms or habbo rooms, by its `kind`, and its
sub-categories. Public Rooms (3) and Guestrooms (4) are the roots.

# Invariants

- Its id is never 0, which ends the client's list of nodes.
- A habbo puts a room only in a category of habbo rooms whose `min_level` its access group level reaches; one with
  `hidden_below_level` is shown only from that level on.

# Lifecycle

- The update [0010-navigator.sql](/migrations/0010-navigator.md) seeds Holo's categories
  (`knowledge/decisions/server/0055-holos-navigator-set.md`); nothing changes them yet.

# Vocabularies

| `kind` | Holds |
|--------|-------|
| `public` | Public rooms |
| `rooms` | Habbo rooms |

# Relations

- Holds [public rooms](/entities/public-room.md) or [rooms](/entities/room.md).

# Tables

- [room_categories](/tables/room_categories.md)

# Queries

- [navigator.query.sql](/queries/navigator.md)
