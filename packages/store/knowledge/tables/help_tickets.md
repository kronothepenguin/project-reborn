---
type: SQLite Table
title: help_tickets
description: Help requests from habbos and forum post reports, picked up and closed by staff.
resource: packages/store/schema/moderation.schema.sql
tags: [store, table, moderation]
timestamp: 2026-10-27T21:28:26+00:00
---

# Schema

| Column | Type | Null | Default | Description | Key / reference |
|--------|------|------|---------|-------------|-----------------|
| `id` | INTEGER | no | rowid | Ticket id | primary key |
| `avatar_id` | INTEGER | yes | | Reporting habbo | → `avatars.id` ON DELETE SET NULL |
| `forum_post_id` | INTEGER | yes | | Reported post; NULL for help requests | → `forum_posts.id` ON DELETE SET NULL |
| `subject` | TEXT | no | | Subject | |
| `message` | TEXT | no | | Message, stored raw | |
| `ip` | TEXT | no | | Reporter IP | |
| `created_at` | DATETIME | no | | Creation time (UTC) | |
| `picked_up_by_user_id` | INTEGER | yes | | Staff user handling it | → `users.id` ON DELETE SET NULL |
| `picked_up_at` | DATETIME | yes | | Pick-up time | |
| `closed_at` | DATETIME | yes | | Closing time; NULL while open | |

# Keys

- Primary key `id`.
- `idx_help_tickets_closed_at` (`closed_at`).

# Related

- Entity: [Help ticket](/entities/help-ticket.md).
