---
type: SQL Query
title: avatars.query.sql
description: Habbo operations for creation, lookup by id or name, the habbos of a user and random habbos.
resource: packages/store/queries/avatars.query.sql
tags: [store, query, habbo]
timestamp: 2026-11-02T02:47:29+00:00
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
- Result: `Avatar`, archived ones too, because their names stay taken; not found for an unknown name
- Tables: `avatars`

## ArchiveAvatar

- Cardinality: `:execrows`
- Inputs: `archived_at`, `updated_at`, `id`, `user_id`
- Result: 1 when the habbo was the user's and not archived yet, 0 otherwise
- Tables: `avatars`

## ListUserAvatars

- Cardinality: `:many`
- Inputs: `user_id`
- Result: the user's habbos, oldest first (`ORDER BY created_at, id`)
- Tables: `avatars`

## ListAllUserAvatars

- Cardinality: `:many`
- Inputs: `user_id`
- Result: the user's habbos, archived ones too, oldest first, for staff
- Tables: `avatars`

## SearchHabbos

- Cardinality: `:many`
- Inputs: `query`, `private`, `row_limit`, `row_offset`
- Result: habbos with their owner's email, archived ones too, by name. A blank query matches every habbo, and otherwise
  part of a name or a whole id. With `private`, also part of an email, the address the user registered from, or one
  they signed in from.
- Tables: `avatars`, `users`, `login_attempts`

## CountHabbos

- Cardinality: `:one`
- Inputs: `query`, `private`
- Result: how many habbos [SearchHabbos](#searchhabbos) finds
- Tables: `avatars`, `users`, `login_attempts`

## CountAvatars

- Cardinality: `:one`
- Inputs: none
- Result: how many habbos exist, the header's registered users
- Tables: `avatars`

## UpdateAvatarLook

- Cardinality: `:exec`
- Inputs: `id`, `figure`, `gender`, `updated_at`
- Tables: `avatars`

## UpdateAvatarMotto

- Cardinality: `:exec`
- Inputs: `id`, `motto`, `updated_at`
- Tables: `avatars`

## ListRandomAvatars

- Cardinality: `:many`
- Inputs: `count`
- Result: up to `count` habbos in random order, for the landing promo
- Tables: `avatars`

# Related

- Entity: [Habbo](/entities/habbo.md).
