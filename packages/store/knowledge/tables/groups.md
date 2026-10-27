---
type: SQLite Table
title: groups
description: Groups created by habbos, with owner, badge code and access mode.
resource: packages/store/schema/groups.schema.sql
tags: [store, table, groups]
timestamp: 2026-10-27T21:28:26+00:00
---

# Schema

| Column | Type | Null | Default | Description | Key / reference |
|--------|------|------|---------|-------------|-----------------|
| `id` | INTEGER | no | rowid | Group id | primary key |
| `avatar_id` | INTEGER | no | | Owner habbo | → `avatars.id` ON DELETE CASCADE |
| `name` | TEXT `COLLATE NOCASE` | no | | Group name | unique, ignoring case |
| `description` | TEXT | no | `''` | Description, stored raw | |
| `badge` | TEXT | no | | Badge code (`b0503Xs09114s05013s05015`) | |
| `access` | TEXT | no | `'open'` | `open`, `moderated` or `closed` | |
| `created_at` | DATETIME | no | | Purchase time (UTC) | |
| `updated_at` | DATETIME | no | | Last change (UTC) | |

# Keys

- Primary key `id`.
- `idx_groups_name` UNIQUE (`name`).
- `idx_groups_avatar_id` (`avatar_id`).

# Related

- Entity: [Group](/entities/group.md).
- Referenced by [group_members](/tables/group_members.md) and [homes](/tables/homes.md).
