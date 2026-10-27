---
type: SQLite Table
title: alerts
description: Staff messages shown in a habbo's feed until dismissed.
resource: packages/store/schema/moderation.schema.sql
tags: [store, table, moderation]
timestamp: 2026-10-27T21:28:26+00:00
---

# Schema

| Column | Type | Null | Default | Description | Key / reference |
|--------|------|------|---------|-------------|-----------------|
| `id` | INTEGER | no | rowid | Alert id | primary key |
| `avatar_id` | INTEGER | no | | Recipient habbo | → `avatars.id` ON DELETE CASCADE |
| `sender_user_id` | INTEGER | yes | | Staff user who sent it | → `users.id` ON DELETE SET NULL |
| `message` | TEXT | no | | Message, stored raw | |
| `created_at` | DATETIME | no | | Send time (UTC) | |
| `dismissed_at` | DATETIME | yes | | Dismissal time; NULL while shown | |

# Keys

- Primary key `id`.
- `idx_alerts_avatar_id_dismissed_at` (`avatar_id`, `dismissed_at`).

# Related

- Entity: [Alert](/entities/alert.md).
