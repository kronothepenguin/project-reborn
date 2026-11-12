---
type: SQL Schema File
title: recycler.schema.sql
description: Declares the recycler: the rewards it gives for furni, and each habbo's recycling.
resource: packages/store/schema/recycler.schema.sql
tags: [store, schema, recycler]
timestamp: 2026-11-12T01:11:06+00:00
---


# Schema

| Structure | Kind | Purpose |
|-----------|------|---------|
| [recycler_rewards](/tables/recycler_rewards.md) | table | What the recycler gives for how many furni |
| [recyclings](/tables/recyclings.md) | table | Each habbo's recycling |

Entities: [Recycler reward](/entities/recycler-reward.md) and [Recycling](/entities/recycling.md). The furni a habbo
gave wait in [furni](/tables/furni.md), under `recycler_avatar_id`.
