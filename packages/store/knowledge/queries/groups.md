---
type: SQL Query
title: groups.query.sql
description: Group operations for buying, finding and counting groups, joining, requests, favourites, roles, member lists, settings, badges and deletion.
resource: packages/store/queries/groups.query.sql
tags: [store, query, groups]
timestamp: 2026-11-05T19:25:27+00:00
---

# Operations

## CreateGroup

- Cardinality: `:one`
- Inputs: `avatar_id` (the owner), `name`, `description`, `badge`, `access`, `created_at`, `updated_at`
- Result: the created `Group` (`RETURNING *`); a taken name, ignoring case, is a conflict
- Tables: `groups`

## GetGroup

- Cardinality: `:one`
- Inputs: `id`
- Result: the group
- Tables: `groups`

## GetGroupByName

- Cardinality: `:one`
- Inputs: `name`
- Result: the group with that name, ignoring case
- Tables: `groups`

## CountUserOwnedGroups

- Cardinality: `:one`
- Inputs: `user_id`
- Result: the groups the user's habbos own together, for `groups.maxOwned`
- Tables: `groups`, `avatars`

## CountAvatarMemberships

- Cardinality: `:one`
- Inputs: `avatar_id`
- Result: the habbo's memberships and waiting requests together, for `groups.maxMemberships`
- Tables: `group_members`

## CountGroupMembers

- Cardinality: `:one`
- Inputs: `group_id`
- Result: the members, without requests and archived habbos
- Tables: `group_members`, `avatars`

## CountGroupRequests

- Cardinality: `:one`
- Inputs: `group_id`
- Result: the waiting requests, without those of archived habbos
- Tables: `group_members`, `avatars`

## GetGroupMember

- Cardinality: `:one`
- Inputs: `group_id`, `avatar_id`
- Result: the habbo's membership or request; not found when it has neither
- Tables: `group_members`

## AddGroupMember

- Cardinality: `:exec`
- Inputs: `group_id`, `avatar_id`, `role`, `requested_at`, `joined_at` (NULL for a waiting request)
- Result: the membership or request
- Tables: `group_members`

## LeaveGroup

- Cardinality: `:execrows`
- Inputs: `group_id`, `avatar_id`
- Result: 1 when the habbo's membership or request went, 0 for the owner, who never leaves
- Tables: `group_members`, `groups`

## ClearFavouriteGroup

- Cardinality: `:exec`
- Inputs: `avatar_id`
- Result: the habbo has no favourite group
- Tables: `group_members`

## SetFavouriteGroup

- Cardinality: `:execrows`
- Inputs: `group_id`, `avatar_id`
- Result: 1 when the group became the favourite, 0 unless the habbo is a member; run after `ClearFavouriteGroup`
- Tables: `group_members`

## UnfavouriteGroup

- Cardinality: `:execrows`
- Inputs: `group_id`, `avatar_id`
- Result: 1 when the group was the favourite and no longer is
- Tables: `group_members`

## AcceptGroupRequest

- Cardinality: `:execrows`
- Inputs: `group_id`, `avatar_id`, `joined_at`
- Result: 1 when a waiting request became a membership, 0 for anything else
- Tables: `group_members`

## DeclineGroupRequest

- Cardinality: `:execrows`
- Inputs: `group_id`, `avatar_id`
- Result: 1 when a waiting request went, 0 for anything else
- Tables: `group_members`

## SetGroupMemberRole

- Cardinality: `:execrows`
- Inputs: `group_id`, `avatar_id`, `role`
- Result: 1 when a member's role changed, 0 for a request or the owner
- Tables: `group_members`, `groups`

## RemoveGroupMember

- Cardinality: `:execrows`
- Inputs: `group_id`, `avatar_id`
- Result: 1 when a member went, 0 for a request or the owner
- Tables: `group_members`, `groups`

## ListGroupMembers

- Cardinality: `:many`
- Inputs: `group_id`, `row_limit`, `row_offset`
- Result: a page of members with their name, figure, creation date, role and favourite: admins first, the owner
  leading them, then members, each in the order they asked to join; archived habbos are left out
- Tables: `group_members`, `avatars`

## ListGroupRequests

- Cardinality: `:many`
- Inputs: `group_id`, `row_limit`, `row_offset`
- Result: a page of waiting requests in the order they were made, without archived habbos
- Tables: `group_members`, `avatars`

## ListAvatarGroups

- Cardinality: `:many`
- Inputs: `avatar_id`
- Result: the groups the habbo has joined, with their badge, creation date and owner, and the habbo's role and
  favourite, in the order it asked to join them
- Tables: `group_members`, `groups`

## GetFavouriteGroup

- Cardinality: `:one`
- Inputs: `avatar_id`
- Result: the id, name and badge of the habbo's favourite group; not found when it has none
- Tables: `group_members`, `groups`

## ListRandomGroups

- Cardinality: `:many`
- Inputs: `count`
- Result: up to `count` groups in random order
- Tables: `groups`

## UpdateGroup

- Cardinality: `:exec`
- Inputs: `id`, `name`, `description`, `access`, `updated_at`
- Result: the group's settings changed
- Tables: `groups`

## DeleteGroupRequests

- Cardinality: `:exec`
- Inputs: `group_id`
- Result: the group's waiting requests are gone, as when its type leaves Exclusive
- Tables: `group_members`

## SetGroupBadge

- Cardinality: `:exec`
- Inputs: `id`, `badge`, `updated_at`
- Result: the group's badge changed
- Tables: `groups`

## DeleteGroup

- Cardinality: `:execrows`
- Inputs: `id`
- Result: 1 when the group went, with its memberships and its home; run `ReturnHomeItemsToPlacers` first
- Tables: `groups`, and by cascade `group_members`, `homes`, `home_items`

## CountGroupsOwnedBy

- Cardinality: `:one`
- Inputs: `avatar_id`
- Result: the number of groups the habbo owns
- Tables: `groups`

## CountGroups

- Cardinality: `:one`
- Inputs: none
- Result: the number of groups
- Tables: `groups`

# Related

- Entity: [Group](/entities/group.md).
