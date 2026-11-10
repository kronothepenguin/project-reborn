---
type: SQL Query
title: club.query.sql
description: Club operations for the end of a user's running membership and of their last period, whether they have any period, and a new period.
resource: packages/store/queries/club.query.sql
tags: [store, query, club]
timestamp: 2026-11-10T02:32:34+00:00
---

# Operations

## GetClubEnd

- Cardinality: `:one`
- Inputs: `user_id`, `now`
- Result: the `ends_at` of the user's last period while a period covers `now`: the club's end, since a period
  bought during the club starts where the last one ends; not found when the user is not a member
- Tables: `club_subscriptions`

## GetLatestClubEnd

- Cardinality: `:one`
- Inputs: `user_id`
- Result: the `ends_at` of the user's last period, past or to come; not found when the user has none. A purchase
  starts at the later of now and this end, so periods never overlap.
- Tables: `club_subscriptions`

## ListClubSubscriptions

- Cardinality: `:many`
- Inputs: `user_id`
- Result: the start and end of each of the user's periods, oldest first; the game server sums the club time the user
  has had from them
- Tables: `club_subscriptions`

## HasClubSubscription

- Cardinality: `:one`
- Inputs: `user_id`
- Result: whether the user has any period, ended or not; a user with none keeps an `HC1` staff gave when the club is
  read
- Tables: `club_subscriptions`

## CreateClubSubscription

- Cardinality: `:exec`
- Inputs: `user_id`, `starts_at`, `ends_at`, `created_at`
- Result: one period; written in the purchase's transaction with the debit, its ledger row and `HC1`
- Tables: `club_subscriptions`

# Related

- Entity: [Club subscription](/entities/club-subscription.md).
