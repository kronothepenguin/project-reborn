---
type: SQLite Table
title: ignored_habbos
description: A habbo whose chat another habbo does not want to see.
resource: packages/store/schema/rooms.schema.sql
tags: [store, table, rooms]
timestamp: 2026-11-10T16:46:21+00:00
---

# Schema

| Column | Type | Null | Default | Description | Key / reference |
|--------|------|------|---------|-------------|-----------------|
| `avatar_id` | INTEGER | no | | Habbo who ignores | primary key part, → `avatars.id` ON DELETE CASCADE |
| `ignored_avatar_id` | INTEGER | no | | Habbo ignored | primary key part, → `avatars.id` ON DELETE CASCADE |
| `created_at` | DATETIME | no | | When (UTC) | |

# Keys

- Primary key (`avatar_id`, `ignored_avatar_id`); `idx_ignored_habbos_ignored_avatar_id` (`ignored_avatar_id`).

# Related

- Entity: [Habbo](/entities/habbo.md).
- Queries: [rooms.query.sql](/queries/rooms.md).
