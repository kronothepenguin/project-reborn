---
type: SQLite Table
title: room_bans
description: A habbo kept out of a room until a time, game.roomBanMinutes after the owner's ban.
resource: packages/store/schema/rooms.schema.sql
tags: [store, table, rooms]
timestamp: 2026-11-10T16:46:21+00:00
---

# Schema

| Column | Type | Null | Default | Description | Key / reference |
|--------|------|------|---------|-------------|-----------------|
| `room_id` | INTEGER | no | | Room | primary key part, → `rooms.id` ON DELETE CASCADE |
| `avatar_id` | INTEGER | no | | Banned habbo | primary key part, → `avatars.id` ON DELETE CASCADE |
| `expires_at` | DATETIME | no | | When the ban ends (UTC); a new ban replaces it | |

# Keys

- Primary key (`room_id`, `avatar_id`); `idx_room_bans_avatar_id` (`avatar_id`).

# Related

- Entity: [Room](/entities/room.md).
- Queries: [rooms.query.sql](/queries/rooms.md).
