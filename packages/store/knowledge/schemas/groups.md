---
type: SQL Schema File
title: groups.schema.sql
description: Declares the groups habbos create and their memberships.
resource: packages/store/schema/groups.schema.sql
tags: [store, schema, groups]
timestamp: 2026-10-27T21:28:26+00:00
---

# Schema

| Structure | Kind | Purpose |
|-----------|------|---------|
| [groups](/tables/groups.md) | table | Groups with owner, badge and access mode |
| `idx_groups_name` | unique index | One group per name, ignoring case |
| `idx_groups_avatar_id` | index | Groups a habbo owns |
| [group_members](/tables/group_members.md) | table | Members, admins and pending requests |
| `idx_group_members_avatar_id` | index | Groups of a habbo |
| `idx_group_members_avatar_id_favourite` | partial unique index | At most one favourite group per habbo |

Entity: [Group](/entities/group.md).
