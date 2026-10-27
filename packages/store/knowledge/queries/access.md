---
type: SQL Query
title: access.query.sql
description: Access operations for groups, their attributes and members, a user's attributes and the holders of an attribute.
resource: packages/store/queries/access.query.sql
tags: [store, query, access]
timestamp: 2026-10-27T21:44:59+00:00
---

# Operations

## CreateAccessGroup

- Cardinality: `:one`
- Inputs: `name`, `description`, `staff_listed`, `created_at`, `updated_at`
- Result: the created `AccessGroup` (`RETURNING *`); a conflict when the name exists, ignoring case
- Tables: `access_groups`

## AddAccessGroupAttribute

- Cardinality: `:exec`
- Inputs: `access_group_id`, `attribute`
- Result: grants the attribute; adding it twice is a no-op
- Tables: `access_group_attributes`

## RemoveAccessGroupAttribute

- Cardinality: `:exec`
- Inputs: `access_group_id`, `attribute`
- Tables: `access_group_attributes`

## AddAccessGroupMember

- Cardinality: `:exec`
- Inputs: `access_group_id`, `user_id`, `display_avatar_id` (nullable), `granted_at`, `granted_by_user_id`
  (nullable)
- Result: a conflict when the user is already a member
- Tables: `access_group_members`

## RemoveAccessGroupMember

- Cardinality: `:exec`
- Inputs: `access_group_id`, `user_id`
- Tables: `access_group_members`

## ListUserAttributes

- Cardinality: `:many`
- Inputs: `user_id`
- Result: the distinct attributes of all the user's groups, sorted
- Tables: `access_group_attributes`, `access_group_members`

## ListAttributeHolders

- Cardinality: `:many`
- Inputs: `attribute`
- Result: the ids of the users holding the attribute through any group, sorted (installer check, last-holder
  guard)
- Tables: `access_group_members`, `access_group_attributes`

# Related

- Entity: [Access group](/entities/access-group.md).
