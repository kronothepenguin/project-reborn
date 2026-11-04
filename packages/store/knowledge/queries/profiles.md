---
type: SQL Query
title: profiles.query.sql
description: Profile operations for creating a habbo's profile, reading, adding and removing its tags, and finding habbos by tag.
resource: packages/store/queries/profiles.query.sql
tags: [store, query, profiles]
timestamp: 2026-11-04T02:31:28+00:00
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

## ListTagCloud

- Cardinality: `:many`
- Inputs: `row_limit`
- Result: up to `row_limit` tags at random, each with how many habbos carry it; an archived habbo's tags do not count
- Tables: `profile_tags`, `profiles`, `avatars`

## ListTaggedAvatars

- Cardinality: `:many`
- Inputs: `tag`, `row_limit`
- Result: up to `row_limit` habbos that carry the tag exactly, with their figure, motto and profile, in the order they
  took it; archived habbos are left out
- Tables: `profile_tags`, `profiles`, `avatars`

## CountTaggedAvatars

- Cardinality: `:one`
- Inputs: `tag`
- Result: how many habbos not archived carry the tag exactly
- Tables: `profile_tags`, `profiles`, `avatars`

# Related

- Entity: [Profile](/entities/profile.md).
