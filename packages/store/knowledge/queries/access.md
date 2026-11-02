---
type: SQL Query
title: access.query.sql
description: Access operations for groups, their attributes and members, a user's attributes and the holders of an attribute.
resource: packages/store/queries/access.query.sql
tags: [store, query, access]
timestamp: 2026-11-02T02:13:59+00:00
---

# Operations

## CreateAccessGroup

- Cardinality: `:one`
- Inputs: `name`, `description`, `staff_listed`, `level`, `created_at`, `updated_at`
- Result: the created `AccessGroup` (`RETURNING *`); a conflict when the name exists, ignoring case
- Tables: `access_groups`

## GetAccessGroup

- Cardinality: `:one`
- Inputs: `id`
- Result: the `AccessGroup`; not found for an unknown id
- Tables: `access_groups`

## ListAccessGroups

- Cardinality: `:many`
- Inputs: none
- Result: `ListAccessGroupsRow`, every group and its `member_count`, sorted by name
- Tables: `access_groups`, `access_group_members`

## DeleteAccessGroup

- Cardinality: `:exec`
- Inputs: `id`
- Result: removes the group, and its attributes and memberships go with it by foreign key
- Tables: `access_groups`

## UpdateAccessGroup

- Cardinality: `:exec`
- Inputs: `name`, `description`, `staff_listed`, `level`, `updated_at`, `id`
- Result: a conflict when another group has the name, ignoring case
- Tables: `access_groups`

## ListAccessGroupAttributes

- Cardinality: `:many`
- Inputs: `access_group_id`
- Result: the group's attributes, sorted
- Tables: `access_group_attributes`

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

## GetAccessGroupMember

- Cardinality: `:one`
- Inputs: `access_group_id`, `user_id`
- Result: the `AccessGroupMember`; not found when the user is not a member
- Tables: `access_group_members`

## UpdateAccessGroupMemberDisplay

- Cardinality: `:exec`
- Inputs: `display_avatar_id` (nullable), `access_group_id`, `user_id`
- Tables: `access_group_members`

## ListAccessGroupMembers

- Cardinality: `:many`
- Inputs: `access_group_id`
- Result: `ListAccessGroupMembersRow` (`user_id`, `display_avatar_id`, `name`), sorted by name. The name is that of the
  display habbo, or of the member's first habbo.
- Tables: `access_group_members`, `avatars`

## ListStaffMembers

- Cardinality: `:many`
- Inputs: `row_limit`
- Result: `ListStaffMembersRow` (`user_id`, `group_name`, `name`), one row per membership, sorted by name and group. The
  name is chosen as in [ListAccessGroupMembers](#listaccessgroupmembers).
- Tables: `access_group_members`, `access_groups`, `avatars`

## ListUserAttributes

- Cardinality: `:many`
- Inputs: `user_id`
- Result: the distinct attributes of the user's groups and those given to the user directly, sorted
- Tables: `access_group_attributes`, `access_group_members`, `user_attributes`

## GetUserLevel

- Cardinality: `:one`
- Inputs: `user_id`
- Result: the highest level of the user's groups, 0 without a group
- Tables: `access_group_members`, `access_groups`

## AddUserAttribute

- Cardinality: `:exec`
- Inputs: `user_id`, `attribute`, `granted_at`, `granted_by_user_id` (nullable)
- Result: gives the attribute to the user directly; nothing happens when they already hold it directly
- Tables: `user_attributes`

## RemoveUserAttribute

- Cardinality: `:exec`
- Inputs: `user_id`, `attribute`
- Tables: `user_attributes`

## ListAttributeHolderDetails

- Cardinality: `:many`
- Inputs: `attribute`, `row_limit`
- Result: `ListAttributeHolderDetailsRow` (`id`, `email`, `name`) of the users holding the attribute directly or through any group,
  sorted by name. The name is that of a display habbo, or of the user's first habbo when no group names one.
- Tables: `users`, `avatars`, `access_group_members`, `access_group_attributes`, `user_attributes`

## ListAttributeHolders

- Cardinality: `:many`
- Inputs: `attribute`
- Result: the ids of the users holding the attribute directly or through any group, sorted (installer check,
  last-holder guard)
- Tables: `access_group_members`, `access_group_attributes`, `user_attributes`

# Related

- Entity: [Access group](/entities/access-group.md).
