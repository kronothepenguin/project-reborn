---
type: SQLite Table
title: room_rights
description: A habbo with rights in a room, which lets it move the room's furni and answer its doorbell.
resource: packages/store/schema/rooms.schema.sql
tags: [store, table, rooms]
timestamp: 2026-11-10T16:46:21+00:00
---

# Schema

| Column | Type | Null | Default | Description | Key / reference |
|--------|------|------|---------|-------------|-----------------|
| `room_id` | INTEGER | no | | Room | primary key part, → `rooms.id` ON DELETE CASCADE |
| `avatar_id` | INTEGER | no | | Habbo with rights | primary key part, → `avatars.id` ON DELETE CASCADE |
| `granted_at` | DATETIME | no | | When the owner gave them (UTC) | |

# Keys

- Primary key (`room_id`, `avatar_id`); `idx_room_rights_avatar_id` (`avatar_id`).

# Related

- Entity: [Room](/entities/room.md).
- Queries: [rooms.query.sql](/queries/rooms.md).
