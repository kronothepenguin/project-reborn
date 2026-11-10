---
type: SQL Schema File
title: rooms.schema.sql
description: Declares what a room keeps between visits, rights, bans, votes and the chat history, and the habbos' ignore lists.
resource: packages/store/schema/rooms.schema.sql
tags: [store, schema, rooms]
timestamp: 2026-11-10T16:46:21+00:00
---

# Schema

| Structure | Kind | Purpose |
|-----------|------|---------|
| [room_rights](/tables/room_rights.md) | table | Habbos with rights in a room |
| `idx_room_rights_avatar_id` | index | The rooms a habbo has rights in |
| [room_bans](/tables/room_bans.md) | table | Habbos kept out of a room until a time |
| `idx_room_bans_avatar_id` | index | A habbo's bans |
| [room_votes](/tables/room_votes.md) | table | Each habbo's vote on a room |
| `idx_room_votes_avatar_id` | index | A habbo's votes |
| [chat_messages](/tables/chat_messages.md) | table | What was said in rooms, kept for moderators |
| `idx_chat_messages_public_room_id_said_at`, `idx_chat_messages_room_id_said_at`, `idx_chat_messages_avatar_id_said_at` | index | A room's or a habbo's lines, newest first |
| `idx_chat_messages_to_avatar_id` | index | The whispers to a habbo |
| `idx_chat_messages_said_at` | index | The lines past the history's age |
| [ignored_habbos](/tables/ignored_habbos.md) | table | Each habbo's ignore list |
| `idx_ignored_habbos_ignored_avatar_id` | index | Who ignores a habbo |

The rooms themselves are [navigator.schema.sql](/schemas/navigator.md)'s. Entities: [Room](/entities/room.md),
[Chat message](/entities/chat-message.md) and [Habbo](/entities/habbo.md).
