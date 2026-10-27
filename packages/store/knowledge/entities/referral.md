---
type: Entity
title: Referral
description: The record that a habbo's referral link brought in a new user, and whether the reward was paid.
tags: [store, entity, referrals]
timestamp: 2026-10-27T21:17:19+00:00
---

# Definition

A referral links a user who registered through `register?refer=<habbo name>` to the referring habbo.

# Invariants

- At most one referral per referred user.
- `rewarded_at` is set once, when the `referral.reward` credits are paid.

# Lifecycle

- Inserted in the registration transaction when the link names an existing habbo.
- Rewarded in the same transaction when `referral.enabled` is on; otherwise `rewarded_at` stays NULL.
- Deleted with the referred user; the referrer is cleared if that habbo is deleted.

# Vocabularies

None.

# Relations

- Refers to the referred [user](/entities/user.md) and the referring [habbo](/entities/habbo.md).

# Tables

- [referrals](/tables/referrals.md)
