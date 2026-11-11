---
type: SQL Query
title: furni.query.sql
description: Furni operations that create a piece, count and list a habbo's hand a page at a time, and list the furni that stands in a room.
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

## ListRoomFurni

- Cardinality: `:many`
- Inputs: `room_id`
- Result: the furni that stands in the room, by id
- Tables: `furni`
