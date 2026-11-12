---
type: Entity
title: Recycling
description: A habbo's exchange of many furni for one, which runs for a time and then waits for the habbo to take its reward.
tags: [store, entity, recycler]
timestamp: 2026-11-12T01:11:06+00:00
---

# Definition

A recycling is a habbo's exchange of many [furni](/entities/furni.md) for one: the furni it gave wait in the recycler,
and after a time the habbo takes the [reward](/entities/recycler-reward.md)
(`plans/server/decisions/0093-a-recycling-is-saved.md`).

# Invariants

- A habbo has one recycling at a time.
- The furni given are in no hand and no room: each names the habbo as its `recycler_avatar_id`.
- Its state is counted from `started_at` and the settings `recycler.sessionMinutes` and `recycler.timeoutMinutes`, so a
  restart changes nothing.

# Lifecycle

- Starting it moves the furni from the habbo's hand into the recycler, in one transaction with the recycling's row. Each
  furni must be recyclable and at least `recycler.minOwnedMinutes` old
  (`plans/server/decisions/0117-the-recycler-checks-a-furnis-age.md`).
- It runs for `recycler.sessionMinutes`. Then the reward is ready until `recycler.timeoutMinutes` after the start.
- Taking the ready reward destroys the furni given and creates the reward in the habbo's hand.
- Refusing it, at any time, gives the furni back; after the time-out that is all the habbo can do
  (`plans/server/decisions/0116-a-recycling-that-waits-too-long-gives-the-furni-back.md`).

# Relations

- Belongs to a [habbo](/entities/habbo.md).
- Brings a [furni definition](/entities/furni-definition.md), its reward.
- Holds [furni](/entities/furni.md).

# Tables

- [recyclings](/tables/recyclings.md)
- [furni](/tables/furni.md), `recycler_avatar_id`

# Queries

- [recycler.query.sql](/queries/recycler.md)
