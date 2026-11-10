---
type: SQLite Table
title: room_votes
description: A habbo's vote on a room, 1 or -1, once; the room's rating is their sum.
resource: packages/store/schema/rooms.schema.sql
tags: [store, table, rooms]
timestamp: 2026-11-10T16:46:21+00:00
---

# Schema

| Column | Type | Null | Default | Description | Key / reference |
|--------|------|------|---------|-------------|-----------------|
| `room_id` | INTEGER | no | | Room | primary key part, → `rooms.id` ON DELETE CASCADE |
| `avatar_id` | INTEGER | no | | Voter | primary key part, → `avatars.id` ON DELETE CASCADE |
| `vote` | INTEGER | no | | `RATEFLAT`'s 1 or -1 | CHECK closed set |
| `voted_at` | DATETIME | no | | When (UTC) | |

# Keys

- Primary key (`room_id`, `avatar_id`): a habbo votes once; `idx_room_votes_avatar_id` (`avatar_id`).

# Related

- Entity: [Room](/entities/room.md).
- Queries: [rooms.query.sql](/queries/rooms.md).
