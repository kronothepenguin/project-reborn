---
type: SQL Query
title: moderation.query.sql
description: Moderation operations for the active ban on a user or an IP, the count of active bans, a habbo's alerts and the count of open help tickets.
resource: packages/store/queries/moderation.query.sql
tags: [store, query, moderation]
timestamp: 2026-10-27T21:44:59+00:00
---

# Operations

## CountActiveBans

- Cardinality: `:one`
- Inputs: `now`
- Result: the number of active bans, as [GetActiveBan](#getactiveban) defines them
- Tables: `bans`

## GetActiveBan

- Cardinality: `:one`
- Inputs: `now`, `user_id` (NULL for an unknown habbo name), `ip`
- Result: the strongest active ban on the user or the IP (permanent first, then the latest expiry); not found when
  none is active
- Active means: `created_at <= now`, not lifted, and no expiry or `expires_at > now`
- Tables: `bans`

`ip` is wrapped in `CAST(… AS TEXT)`, and `now` is first compared with the non-null `created_at`, so sqlc types
them `string` and `time.Time` instead of copying the nullability of `bans.ip` and `bans.expires_at`.

## GetOldestAlert

- Cardinality: `:one`
- Inputs: `avatar_id`
- Result: the habbo's oldest undismissed alert; not found when none is left
- Tables: `alerts`

## DismissAlert

- Cardinality: `:execrows`
- Inputs: `id`, `avatar_id`, `dismissed_at`
- Result: 1 when the habbo's alert was dismissed, 0 otherwise, so a habbo cannot dismiss another's
- Tables: `alerts`

## CountOpenHelpTickets

- Cardinality: `:one`
- Result: how many tickets nobody has picked up or closed
- Tables: `help_tickets`

# Related

- Entities: [Ban](/entities/ban.md), [Alert](/entities/alert.md), [Help ticket](/entities/help-ticket.md).
