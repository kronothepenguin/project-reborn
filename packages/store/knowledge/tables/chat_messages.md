---
type: SQLite Table
title: chat_messages
description: A line said in a public room or a habbo room, chat, whisper or shout, kept for moderators for game.chatHistoryDays.
resource: packages/store/schema/rooms.schema.sql
tags: [store, table, rooms]
timestamp: 2026-11-10T16:46:21+00:00
---

# Schema

| Column | Type | Null | Default | Description | Key / reference |
|--------|------|------|---------|-------------|-----------------|
| `id` | INTEGER | no | | Line | primary key |
| `public_room_id` | INTEGER | yes | | Public room it was said in | → `public_rooms.id` ON DELETE SET NULL |
| `room_id` | INTEGER | yes | | Habbo room it was said in | → `rooms.id` ON DELETE SET NULL |
| `avatar_id` | INTEGER | no | | Speaker | → `avatars.id` ON DELETE CASCADE |
| `kind` | TEXT | no | | `chat`, `whisper` or `shout` | CHECK closed set |
| `to_avatar_id` | INTEGER | yes | | A whisper's habbo | → `avatars.id` ON DELETE SET NULL |
| `text` | TEXT | no | | What was said | |
| `said_at` | DATETIME | no | | When (UTC) | |

# Keys

- Primary key `id`; indexes by public room, room and speaker with `said_at`, by `to_avatar_id`, and by `said_at`.
- `CHECK (public_room_id IS NULL OR room_id IS NULL)`: a line names one room at most.

# Notes

- A deleted habbo room leaves its lines without a room, so that deleting a room never erases what was said in it
  (`knowledge/decisions/server/0066-staff-read-the-chat-history-30-days.md`).

# Related

- Entity: [Chat message](/entities/chat-message.md).
- Queries: [rooms.query.sql](/queries/rooms.md).
