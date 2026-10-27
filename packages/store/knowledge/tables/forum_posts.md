---
type: SQLite Table
title: forum_posts
description: BBCode posts of a discussion board thread, with their last edit.
resource: packages/store/schema/forums.schema.sql
tags: [store, table, forums]
timestamp: 2026-10-27T21:28:26+00:00
---

# Schema

| Column | Type | Null | Default | Description | Key / reference |
|--------|------|------|---------|-------------|-----------------|
| `id` | INTEGER | no | rowid | Post id | primary key |
| `forum_thread_id` | INTEGER | no | | Thread | → `forum_threads.id` ON DELETE CASCADE |
| `avatar_id` | INTEGER | yes | | Author habbo; NULL once deleted | → `avatars.id` ON DELETE SET NULL |
| `body` | TEXT | no | | Post in BBCode, stored raw | |
| `created_at` | DATETIME | no | | Posting time (UTC) | |
| `edited_at` | DATETIME | yes | | Last edit time (UTC) | |
| `edited_by_avatar_id` | INTEGER | yes | | Habbo that edited last | → `avatars.id` ON DELETE SET NULL |

# Keys

- Primary key `id`.
- `idx_forum_posts_forum_thread_id_created_at` (`forum_thread_id`, `created_at`).
- `idx_forum_posts_avatar_id` (`avatar_id`).

# Related

- Entity: [Forum thread](/entities/forum-thread.md).
- Referenced by [help_tickets](/tables/help_tickets.md).
