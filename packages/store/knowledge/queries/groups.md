---
type: SQL Query
title: groups.query.sql
description: Group operations, currently the count of groups for housekeeping's dashboard.
resource: packages/store/queries/groups.query.sql
tags: [store, query, groups]
timestamp: 2026-11-02T02:47:29+00:00
---

# Operations

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
