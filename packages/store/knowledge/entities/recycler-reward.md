---
type: Entity
title: Recycler reward
description: What the recycler gives for a number of furni recycled at once.
tags: [store, entity, recycler]
timestamp: 2026-11-12T01:11:06+00:00
---

# Definition

A recycler reward is the [furni](/entities/furni-definition.md) a habbo gets for giving the recycler a number of furni
at once.

# Invariants

- There is one reward for a number of furni, and the number is above 0.
- A [recycling](/entities/recycling.md) takes exactly as many furni as a reward asks.

# Lifecycle

- The update [0020-recycler.sql](/migrations/0020-recycler.md) seeds Holo's four: a Palm Chair for 20 furni, a Water
  Garden for 30, a Polar Sofa for 40 and a Moon Lamp for 50. Another update adds or changes one.

# Relations

- Gives a [furni definition](/entities/furni-definition.md).

# Tables

- [recycler_rewards](/tables/recycler_rewards.md)

# Queries

- [recycler.query.sql](/queries/recycler.md)
