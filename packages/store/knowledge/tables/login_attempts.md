---
type: SQLite Table
title: login_attempts
description: Every login attempt, successful or not, used for throttling and for the IP history of users and habbos.
resource: packages/store/schema/auth.schema.sql
tags: [store, table, auth]
timestamp: 2026-10-27T21:17:19+00:00
---

# Schema

| Column | Type | Null | Default | Description | Key / reference |
|--------|------|------|---------|-------------|-----------------|
| `id` | INTEGER | no | rowid | Attempt id | primary key |
| `user_id` | INTEGER | yes | | User of the named habbo; NULL for an unknown name | → `users.id` ON DELETE CASCADE |
| `avatar_id` | INTEGER | yes | | Named habbo; NULL for an unknown name | → `avatars.id` ON DELETE SET NULL |
| `ip` | TEXT | no | | Client IP | |
| `succeeded` | BOOLEAN | no | | Whether the attempt signed in | |
| `created_at` | DATETIME | no | | Attempt time (UTC) | |

# Keys

- Primary key `id`.
- `idx_login_attempts_ip_created_at` (`ip`, `created_at`), `idx_login_attempts_user_id_created_at` (`user_id`,
  `created_at`), `idx_login_attempts_avatar_id_created_at` (`avatar_id`, `created_at`).

# Related

- Entity: [Session](/entities/session.md).
- Queries: [auth.query.sql](/queries/auth.md).
