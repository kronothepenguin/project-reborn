---
type: SQLite Table
title: staff_logs
description: One row per staff action, with the acting user, the target and the IP.
resource: packages/store/schema/moderation.schema.sql
tags: [store, table, moderation]
timestamp: 2026-10-27T21:28:26+00:00
---

# Schema

| Column | Type | Null | Default | Description | Key / reference |
|--------|------|------|---------|-------------|-----------------|
| `id` | INTEGER | no | rowid | Log id | primary key |
| `user_id` | INTEGER | yes | | Acting staff user | → `users.id` ON DELETE SET NULL |
| `target_user_id` | INTEGER | yes | | Affected user | → `users.id` ON DELETE SET NULL |
| `target_avatar_id` | INTEGER | yes | | Affected habbo | → `avatars.id` ON DELETE SET NULL |
| `action` | TEXT | no | | What was done | |
| `detail` | TEXT | no | `''` | Free detail (amount, reason, setting key) | |
| `ip` | TEXT | no | | Actor IP | |
| `created_at` | DATETIME | no | | Action time (UTC) | |

# Keys

- Primary key `id`.
- `idx_staff_logs_created_at` (`created_at`), `idx_staff_logs_target_user_id` (`target_user_id`),
  `idx_staff_logs_target_avatar_id` (`target_avatar_id`).

# Related

- Entity: [Staff log](/entities/staff-log.md) (allowed `action` values are listed there).
