---
type: SQL Query
title: furni.query.sql
description: Furni operations: creating a piece, and counting and listing a habbo's hand a page at a time.
resource: packages/store/queries/furni.query.sql
tags: [store, query, furni]
timestamp: 2026-11-11T16:24:23+00:00
---

# Operations

## CreateFurni

- Cardinality: `:one`
- Inputs: `furni_definition_id`, `user_id`, `avatar_id` (none for the shared inventory), `state`, `created_at`
- Result: the new piece, in the habbo's hand or in the user's shared inventory
- Tables: `furni`

## CountHandFurni

- Cardinality: `:one`
- Inputs: `avatar_id`
- Result: how many furni the habbo's hand holds
- Tables: `furni`

## ListHandFurni

- Cardinality: `:many`
- Inputs: `avatar_id`, `page_size`, `skip`
- Result: the hand's furni after the first `skip`, at most `page_size`, the oldest first
- Tables: `furni`
