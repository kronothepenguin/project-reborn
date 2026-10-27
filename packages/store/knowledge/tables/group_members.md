---
type: SQLite Table
title: group_members
description: Members, admins and pending membership requests of groups, with each habbo's favourite group.
resource: packages/store/schema/groups.schema.sql
tags: [store, table, groups]
timestamp: 2026-10-27T21:28:26+00:00
---

# Schema

| Column | Type | Null | Default | Description | Key / reference |
|--------|------|------|---------|-------------|-----------------|
| `group_id` | INTEGER | no | | Group | primary key part, → `groups.id` ON DELETE CASCADE |
| `avatar_id` | INTEGER | no | | Member habbo | primary key part, → `avatars.id` ON DELETE CASCADE |
| `role` | TEXT | no | `'member'` | `member` or `admin` | |
| `favourite` | BOOLEAN | no | FALSE | The habbo's favourite group | |
| `requested_at` | DATETIME | no | | Join or request time (UTC) | |
| `joined_at` | DATETIME | yes | | Acceptance time; NULL while pending | |

# Keys

- Primary key (`group_id`, `avatar_id`).
- `idx_group_members_avatar_id` (`avatar_id`).
- `idx_group_members_avatar_id_favourite` UNIQUE (`avatar_id`) WHERE `favourite`.

# Related

- Entity: [Group](/entities/group.md).
