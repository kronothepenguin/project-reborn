---
type: SQL Schema File
title: referrals.schema.sql
description: Declares the referrals table, which records the habbo that referred each new user.
resource: packages/store/schema/referrals.schema.sql
tags: [store, schema, referrals]
timestamp: 2026-10-27T21:17:19+00:00
---

# Schema

| Structure | Kind | Purpose |
|-----------|------|---------|
| [referrals](/tables/referrals.md) | table | Referred user, referring habbo, reward time |
| `idx_referrals_referrer_avatar_id` | index | Referrals of a habbo |

Entity: [Referral](/entities/referral.md).
