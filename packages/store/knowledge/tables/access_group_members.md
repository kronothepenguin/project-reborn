---
type: SQLite Table
title: access_group_members
description: Users who belong to an access group, with the habbo shown for them on the staff page.
resource: packages/store/schema/access.schema.sql
tags: [store, table, access]
timestamp: 2026-10-27T21:17:19+00:00
---

# Schema

| Column | Type | Null | Default | Description | Key / reference |
|--------|------|------|---------|-------------|-----------------|
| `access_group_id` | INTEGER | no | | Group | primary key part, → `access_groups.id` ON DELETE CASCADE |
| `user_id` | INTEGER | no | | Member | primary key part, → `users.id` ON DELETE CASCADE |
| `display_avatar_id` | INTEGER | yes | | One of the member's habbos, shown on `/staff` | → `avatars.id` ON DELETE SET NULL |
| `granted_at` | DATETIME | no | | Grant time (UTC) | |
| `granted_by_user_id` | INTEGER | yes | | User who granted the membership | → `users.id` ON DELETE SET NULL |

# Keys

- Primary key (`access_group_id`, `user_id`).
- `idx_access_group_members_user_id` (`user_id`).

# Related

- Entity: [Access group](/entities/access-group.md).
- Queries: [access.query.sql](/queries/access.md).
