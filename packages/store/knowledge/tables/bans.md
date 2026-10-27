---
type: SQLite Table
title: bans
description: Bans of a user, an IP or both, with reason, expiry and lifting.
resource: packages/store/schema/moderation.schema.sql
tags: [store, table, moderation]
timestamp: 2026-10-27T21:28:26+00:00
---

# Schema

| Column | Type | Null | Default | Description | Key / reference |
|--------|------|------|---------|-------------|-----------------|
| `id` | INTEGER | no | rowid | Ban id | primary key |
| `user_id` | INTEGER | yes | | Banned user, so all of their habbos | → `users.id` ON DELETE CASCADE |
| `ip` | TEXT | yes | | Banned IP | |
| `reason` | TEXT | no | | Reason shown at login | |
| `issued_by_user_id` | INTEGER | yes | | Staff user who banned | → `users.id` ON DELETE SET NULL |
| `created_at` | DATETIME | no | | Ban time (UTC) | |
| `expires_at` | DATETIME | yes | | Expiry; NULL is permanent | |
| `lifted_at` | DATETIME | yes | | Early lifting time | |
| `lifted_by_user_id` | INTEGER | yes | | Staff user who lifted it | → `users.id` ON DELETE SET NULL |

CHECK: `user_id` or `ip` is set.

# Keys

- Primary key `id`.
- `idx_bans_user_id` (`user_id`), `idx_bans_ip` (`ip`).

# Related

- Entity: [Ban](/entities/ban.md).
