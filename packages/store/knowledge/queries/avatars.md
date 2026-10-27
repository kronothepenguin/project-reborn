---
type: SQL Query
title: avatars.query.sql
description: Habbo operations for creation, lookup by id or name, and the habbos of a user.
resource: packages/store/queries/avatars.query.sql
tags: [store, query, habbo]
timestamp: 2026-10-27T21:44:59+00:00
---

# Operations

## CreateAvatar

- Cardinality: `:one`
- Inputs: `user_id`, `name`, `figure`, `gender`, `motto`, `created_at`, `updated_at`
- Result: the created `Avatar` (`RETURNING *`); a conflict when the name exists, ignoring case
- Tables: `avatars`

## GetAvatar

- Cardinality: `:one`
- Inputs: `id`
- Result: `Avatar`
- Tables: `avatars`

## GetAvatarByName

- Cardinality: `:one`
- Inputs: `name` (matched ignoring case)
- Result: `Avatar`; not found for an unknown name
- Tables: `avatars`

## ListUserAvatars

- Cardinality: `:many`
- Inputs: `user_id`
- Result: the user's habbos, oldest first (`ORDER BY created_at, id`)
- Tables: `avatars`

# Related

- Entity: [Habbo](/entities/habbo.md).
