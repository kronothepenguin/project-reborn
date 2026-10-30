---
type: SQL Query
title: referrals.query.sql
description: Referral operations, currently the creation of a referral at registration.
resource: packages/store/queries/referrals.query.sql
tags: [store, query, referrals]
timestamp: 2026-10-30T22:30:00+00:00
---

# Operations

## CreateReferral

- Cardinality: `:exec`
- Inputs: `referred_user_id`, `referrer_avatar_id`, `created_at`, `rewarded_at` (NULL when not paid)
- Result: one referral; written in the registration transaction
- Tables: `referrals`

# Related

- Entity: [Referral](/entities/referral.md).
