---
type: SQL Query
title: profiles.query.sql
description: Profile operations, currently the creation of a habbo's profile.
resource: packages/store/queries/profiles.query.sql
tags: [store, query, profiles]
timestamp: 2026-10-27T21:44:59+00:00
---

# Operations

## CreateProfile

- Cardinality: `:one`
- Inputs: `avatar_id`, `created_at`, `updated_at`
- Result: the created `Profile` (`RETURNING *`); a conflict when the habbo already has one
- Tables: `profiles`

# Related

- Entity: [Profile](/entities/profile.md).
