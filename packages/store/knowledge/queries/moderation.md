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

## CreateBan

- Cardinality: `:one`
- Inputs: `user_id`, `ip`, `reason`, `issued_by_user_id`, `created_at`, `expires_at`
- Result: the created `Ban` (`RETURNING *`)
- Tables: `bans`

## GetBan

- Cardinality: `:one`
- Inputs: `id`
- Result: `Ban`, active or not; not found for an unknown id
- Tables: `bans`

## ListActiveBans

- Cardinality: `:many`
- Inputs: `now`, `row_limit`, `row_offset`
- Result: the active bans, as [GetActiveBan](#getactiveban) defines them, newest first, each with the first habbo of its
  user, and a blank name for a ban on an address alone
- Tables: `bans`, `avatars`

## LiftBan

- Cardinality: `:execrows`
- Inputs: `id`, `lifted_at`, `lifted_by_user_id`
- Result: 1 when the ban was lifted, and 0 when it had been already
- Tables: `bans`

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

## CreateAlert

- Cardinality: `:exec`
- Inputs: `avatar_id`, `sender_user_id`, `message`, `created_at`
- Tables: `alerts`

## CreateAlertForEveryone

- Cardinality: `:execrows`
- Inputs: `sender_user_id`, `message`, `created_at`
- Result: how many habbos got the alert, one row for each habbo that is not archived
- Tables: `alerts`, `avatars`

## CountActiveAlerts

- Cardinality: `:one`
- Result: how many alerts nobody has dismissed
- Tables: `alerts`

## ListActiveAlerts

- Cardinality: `:many`
- Inputs: `row_limit`, `row_offset`
- Result: the alerts nobody has dismissed, newest first, with the name of the habbo
- Tables: `alerts`, `avatars`

## CountOpenHelpTickets

- Cardinality: `:one`
- Result: how many tickets nobody has picked up or closed
- Tables: `help_tickets`

# Related

- Entities: [Ban](/entities/ban.md), [Alert](/entities/alert.md), [Help ticket](/entities/help-ticket.md).
