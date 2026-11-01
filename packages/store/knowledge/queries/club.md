---
type: SQL Query
title: club.query.sql
description: Club operations, currently the end of a habbo's running membership.
resource: packages/store/queries/club.query.sql
tags: [store, query, club]
timestamp: 2026-11-01T21:04:04+00:00
---

# Operations

## GetClubEnd

- Cardinality: `:one`
- Inputs: `avatar_id`, `now`
- Result: the latest `ends_at` of the periods covering `now`; not found when the habbo is not a member
- Tables: `club_subscriptions`

# Related

- Entity: [Club subscription](/entities/club-subscription.md).
