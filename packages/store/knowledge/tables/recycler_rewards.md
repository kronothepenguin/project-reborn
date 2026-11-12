---
type: SQLite Table
title: recycler_rewards
description: What the recycler gives: the furni a habbo gets for recycling a number of pieces at once.
resource: packages/store/schema/recycler.schema.sql
tags: [store, table, recycler]
timestamp: 2026-11-12T01:11:06+00:00
---


# Schema

| Column | Type | Null | Default | Description | Key / reference |
|--------|------|------|---------|-------------|-----------------|
| `furni_count` | INTEGER | no | | How many furni the reward takes | primary key, CHECK above 0 |
| `furni_definition_id` | INTEGER | no | | The furni given | → `furni_definitions.id` |

# Keys

- Primary key `furni_count`: one reward for a number of furni.

# Related

- Entity: [Recycler reward](/entities/recycler-reward.md).
- Queries: [recycler.query.sql](/queries/recycler.md).
