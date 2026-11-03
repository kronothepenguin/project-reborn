---
type: SQL Query
title: profiles.query.sql
description: Profile operations for creating a habbo's profile and reading, adding and removing its tags.
resource: packages/store/queries/profiles.query.sql
tags: [store, query, profiles]
timestamp: 2026-11-03T17:58:55+00:00
---

# Operations

## CreateProfile

- Cardinality: `:one`
- Inputs: `avatar_id`, `created_at`, `updated_at`
- Result: the created `Profile` (`RETURNING *`); a conflict when the habbo already has one
- Tables: `profiles`

## GetAvatarProfile

- Cardinality: `:one`
- Inputs: `avatar_id`
- Result: the habbo's `Profile`
- Tables: `profiles`

## ListProfileTags

- Cardinality: `:many`
- Inputs: `profile_id`
- Result: the profile's tags, oldest first
- Tables: `profile_tags`

## CountProfileTags

- Cardinality: `:one`
- Inputs: `profile_id`
- Result: how many tags the profile has
- Tables: `profile_tags`

## AddProfileTag

- Cardinality: `:execrows`
- Inputs: `profile_id`, `tag`, `created_at`
- Result: 1 when the tag was added, 0 when the profile had it
- Tables: `profile_tags`

## DeleteProfileTag

- Cardinality: `:execrows`
- Inputs: `profile_id`, `tag`
- Result: 1 when the profile had the tag, 0 otherwise
- Tables: `profile_tags`

# Related

- Entity: [Profile](/entities/profile.md).
