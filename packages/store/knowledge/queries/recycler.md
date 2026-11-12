---
type: SQL Query
title: recycler.query.sql
description: Recycler operations that list the rewards, read, create and delete a habbo's recycling, and move furni into the recycler, back to the hand or out of the store.
resource: packages/store/queries/recycler.query.sql
tags: [store, query, recycler]
timestamp: 2026-11-12T01:11:06+00:00
---


# Operations

## ListRecyclerRewards

- Cardinality: `:many`
- Inputs: none
- Result: every reward, the fewest furni first
- Tables: `recycler_rewards`

## GetRecycling

- Cardinality: `:one`
- Inputs: `avatar_id`
- Result: the habbo's recycling
- Tables: `recyclings`

## CreateRecycling

- Cardinality: `:exec`
- Inputs: `avatar_id`, `furni_definition_id`, `started_at`
- Result: the habbo's recycling starts; a second one is a conflict
- Tables: `recyclings`

## DeleteRecycling

- Cardinality: `:execrows`
- Inputs: `avatar_id`
- Result: the habbo's recycling is gone
- Tables: `recyclings`

## RecycleFurni

- Cardinality: `:execrows`
- Inputs: `id`, `avatar_id`, `made_before`
- Result: the piece leaves the habbo's hand for its recycler; no row changes when the hand does not hold it, or when
  it was made after `made_before`
- Tables: `furni`

## ReturnRecycledFurni

- Cardinality: `:exec`
- Inputs: `avatar_id`
- Result: everything in the habbo's recycler is back in its hand
- Tables: `furni`

## DeleteRecycledFurni

- Cardinality: `:execrows`
- Inputs: `avatar_id`
- Result: everything in the habbo's recycler is destroyed
- Tables: `furni`
