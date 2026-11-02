---
type: SQL Schema File
title: access.schema.sql
description: Declares the attribute-based access tables for access groups, their attributes and members, and the attributes given to a user directly.
resource: packages/store/schema/access.schema.sql
tags: [store, schema, access]
timestamp: 2026-11-02T01:52:57+00:00
---

# Schema

| Structure | Kind | Purpose |
|-----------|------|---------|
| [access_groups](/tables/access_groups.md) | table | Named groups, optionally listed on the staff page |
| `idx_access_groups_name` | unique index | One group per name, ignoring case |
| [access_group_attributes](/tables/access_group_attributes.md) | table | Attributes a group grants |
| [access_group_members](/tables/access_group_members.md) | table | Users in a group, with their display habbo |
| `idx_access_group_members_user_id` | index | Groups of a user |
| [user_attributes](/tables/user_attributes.md) | table | Attributes given to a user directly |
| `idx_user_attributes_attribute` | index | Users holding an attribute directly |

Entity: [Access group](/entities/access-group.md).
