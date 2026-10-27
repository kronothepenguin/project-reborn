---
type: SQL Query
title: moderation.query.sql
description: Moderation operations, currently the lookup of the active ban on a user or an IP.
resource: packages/store/queries/moderation.query.sql
tags: [store, query, moderation]
timestamp: 2026-10-27T21:44:59+00:00
---

# Operations

## GetActiveBan

- Cardinality: `:one`
- Inputs: `now`, `user_id` (NULL for an unknown habbo name), `ip`
- Result: the strongest active ban on the user or the IP (permanent first, then the latest expiry); not found when
  none is active
- Active means: `created_at <= now`, not lifted, and no expiry or `expires_at > now`
- Tables: `bans`

`ip` is wrapped in `CAST(… AS TEXT)`, and `now` is first compared with the non-null `created_at`, so sqlc types
them `string` and `time.Time` instead of copying the nullability of `bans.ip` and `bans.expires_at`.

# Related

- Entity: [Ban](/entities/ban.md).
