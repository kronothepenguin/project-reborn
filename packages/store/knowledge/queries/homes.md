---
type: SQL Query
title: homes.query.sql
description: Home operations, currently the creation of a profile's home.
resource: packages/store/queries/homes.query.sql
tags: [store, query, homes]
timestamp: 2026-10-27T21:44:59+00:00
---

# Operations

## CreateProfileHome

- Cardinality: `:one`
- Inputs: `profile_id`, `updated_at`
- Result: the created `Home` (`RETURNING *`) with the default background
- Tables: `homes`

`profile_id` is wrapped in `CAST(… AS INTEGER)` so sqlc types it `int64` instead of copying the nullability of
`homes.profile_id`.

# Related

- Entity: [Home](/entities/home.md).
