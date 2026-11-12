---
type: SQL Update
title: 0020-recycler.sql
description: Creates recycler_rewards, with Holo's four rewards, and recyclings, and adds to furni the habbo whose recycler a piece waits in.
resource: packages/store/migrations/0020-recycler.sql
tags: [store, update, recycler]
timestamp: 2026-11-12T01:11:06+00:00
---

# Update

| | |
|---|---|
| Title | The recycler gives a furni for many: its rewards, each habbo's recycling, and the furni that wait in it. |
| Automatic | no |

Creates [recycler_rewards](/tables/recycler_rewards.md) and [recyclings](/tables/recyclings.md), and adds
`recycler_avatar_id` to [furni](/tables/furni.md) with the index `idx_furni_recycler_avatar_id`
(`plans/server/decisions/0093-a-recycling-is-saved.md`).

Seeds Holo's four rewards, which an administrator's change survives: the furni 463 for 20 furni, 464 for 30, 462 for 40
and 1279 for 50.
