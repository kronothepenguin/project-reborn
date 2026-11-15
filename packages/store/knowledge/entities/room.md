---
type: Entity
title: Room
description: A habbo's room, created with the room-o-matic, with its creator, owner, category, model, door and settings.
tags: [store, entity, navigator]
timestamp: 2026-11-10T16:46:21+00:00
---

# Definition

A room a habbo created. Its creator never changes; its owner is a habbo of the same user
(`knowledge/decisions/holo-port/0057-furni-and-rooms.md`).

# Invariants

- A habbo owns up to `game.maxRoomsPerHabbo` rooms (`knowledge/decisions/server/0056-own-rooms-follow-holos-rules.md`).
- The password is stored as a hash (`knowledge/decisions/server/0062-room-passwords-are-hashed.md`).
- Only its owner changes or deletes it.
- When its owner is archived, it becomes the user's active habbo's, with its furni in place
  (`knowledge/decisions/server/0124-an-archived-habbos-rooms-move-to-the-active-habbo.md`).

# Lifecycle

- The game server creates it, changes it at its owner's request, and deletes it with its favourites. Its furni then
  goes to the owner's hand (`knowledge/decisions/server/0059-a-deleted-rooms-furni-goes-to-its-owner.md`).

# Vocabularies

| `door` | Meaning |
|--------|---------|
| `open` | Anyone enters |
| `closed` | A visitor rings the bell |
| `password` | A visitor types the password |

# Relations

- Created and owned by [habbos](/entities/habbo.md); in a [room category](/entities/room-category.md), on a
  [room model](/entities/room-model.md); may be a [favourite room](/entities/favourite-room.md).
- Gives rights to habbos, bans them for `game.roomBanMinutes`, takes their votes, and keeps what is said in it as
  [chat messages](/entities/chat-message.md).

# Tables

- [rooms](/tables/rooms.md)
- [room_rights](/tables/room_rights.md)
- [room_bans](/tables/room_bans.md)
- [room_votes](/tables/room_votes.md)

# Queries

- [navigator.query.sql](/queries/navigator.md)
- [rooms.query.sql](/queries/rooms.md)
