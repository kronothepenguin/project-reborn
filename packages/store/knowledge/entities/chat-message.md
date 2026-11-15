---
type: Entity
title: Chat message
description: A line a habbo said, whispered or shouted in a room, kept for moderators for game.chatHistoryDays.
tags: [store, entity, rooms]
timestamp: 2026-11-10T16:46:21+00:00
---

# Definition

What a habbo said in a public room or a habbo room, whispered to another habbo, or shouted, as the game server saw it.

# Invariants

- It names its speaker, and a whisper the habbo it went to.
- A deleted habbo room leaves its lines without a room.

# Lifecycle

- The game server saves each line as it reaches the room; housekeeping's chat logs read them; lines older than
  `game.chatHistoryDays` are deleted (`knowledge/decisions/server/0066-staff-read-the-chat-history-30-days.md`).

# Vocabularies

| `kind` | Meaning |
|--------|---------|
| `chat` | Said to the room |
| `whisper` | Said to one habbo |
| `shout` | Shouted to the room |

# Relations

- Said by a [habbo](/entities/habbo.md) in a [public room](/entities/public-room.md) or a [room](/entities/room.md).

# Tables

- [chat_messages](/tables/chat_messages.md)

# Queries

- [rooms.query.sql](/queries/rooms.md)
