---
type: SQL Query
title: club.query.sql
description: Club operations, currently the end of a user's running membership.
resource: packages/store/queries/club.query.sql
tags: [store, query, club]
timestamp: 2026-11-02T01:44:15+00:00
---

# Operations

## GetClubEnd

- Cardinality: `:one`
- Inputs: `user_id`, `now`
- Result: the latest `ends_at` of the periods covering `now`; not found when the user is not a member
- Tables: `club_subscriptions`

# Related

- Entity: [Club subscription](/entities/club-subscription.md).
