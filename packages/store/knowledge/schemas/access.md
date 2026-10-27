---
type: SQL Schema File
title: access.schema.sql
description: Declares the attribute-based access tables for access groups, their attributes and their members.
resource: packages/store/schema/access.schema.sql
tags: [store, schema, access]
timestamp: 2026-10-27T21:17:19+00:00
---

# Schema

| Structure | Kind | Purpose |
|-----------|------|---------|
| [access_groups](/tables/access_groups.md) | table | Named groups, optionally listed on the staff page |
| `idx_access_groups_name` | unique index | One group per name, ignoring case |
| [access_group_attributes](/tables/access_group_attributes.md) | table | Attributes a group grants |
| [access_group_members](/tables/access_group_members.md) | table | Users in a group, with their display habbo |
| `idx_access_group_members_user_id` | index | Groups of a user |

Entity: [Access group](/entities/access-group.md).
