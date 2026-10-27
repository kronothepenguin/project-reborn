---
type: SQLite Table
title: avatar_badges
description: Badges owned by a habbo, at most one of them worn.
resource: packages/store/schema/avatars.schema.sql
tags: [store, table, habbo]
timestamp: 2026-10-27T21:17:19+00:00
---

# Schema

| Column | Type | Null | Default | Description | Key / reference |
|--------|------|------|---------|-------------|-----------------|
| `avatar_id` | INTEGER | no | | Owning habbo | primary key part, → `avatars.id` ON DELETE CASCADE |
| `code` | TEXT | no | | Badge code known to the client (for example `HC1`) | primary key part |
| `worn` | BOOLEAN | no | FALSE | Whether the habbo shows this badge | |
| `granted_at` | DATETIME | no | | Grant time (UTC) | |

# Keys

- Primary key (`avatar_id`, `code`).
- `idx_avatar_badges_avatar_id_worn` UNIQUE (`avatar_id`) WHERE `worn`: at most one worn badge per habbo.

# Related

- Entity: [Habbo](/entities/habbo.md).
