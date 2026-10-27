---
type: SQLite Table
title: forum_threads
description: Threads of the site-wide discussion board, with sticky and locked flags and a view counter.
resource: packages/store/schema/forums.schema.sql
tags: [store, table, forums]
timestamp: 2026-10-27T21:28:26+00:00
---

# Schema

| Column | Type | Null | Default | Description | Key / reference |
|--------|------|------|---------|-------------|-----------------|
| `id` | INTEGER | no | rowid | Thread id | primary key |
| `avatar_id` | INTEGER | yes | | Author habbo; NULL once deleted | → `avatars.id` ON DELETE SET NULL |
| `title` | TEXT | no | | Title, stored raw | |
| `sticky` | BOOLEAN | no | FALSE | Listed before other threads | |
| `locked` | BOOLEAN | no | FALSE | No new replies | |
| `views` | INTEGER | no | 0 | View counter | CHECK ≥ 0 |
| `created_at` | DATETIME | no | | Creation time (UTC) | |

# Keys

- Primary key `id`.
- `idx_forum_threads_created_at` (`created_at`).

# Related

- Entity: [Forum thread](/entities/forum-thread.md).
- Referenced by [forum_posts](/tables/forum_posts.md).
