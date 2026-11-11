---
type: SQL Query
title: furni.query.sql
description: Furni operations that create and read a piece, list a habbo's hand a page at a time and a room's furni, and place, move and pick up furni.
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

## GetFurni

- Cardinality: `:one`
- Inputs: `id`
- Result: the piece of furni
- Tables: `furni`

## PlaceFurni

- Cardinality: `:execrows`
- Inputs: `id`, `avatar_id`, `room_id`, `x`, `y`, `altitude`, `direction`, `wall_position`
- Result: the piece leaves the habbo's hand and stands in the room at that place; no row changes when the hand does
  not hold it
- Tables: `furni`

## MoveFurni

- Cardinality: `:execrows`
- Inputs: `id`, `room_id`, `x`, `y`, `altitude`, `direction`
- Result: the piece stands elsewhere in its room; no row changes when the room does not have it
- Tables: `furni`

## PickUpFurni

- Cardinality: `:execrows`
- Inputs: `id`, `room_id`, `user_id`, `avatar_id`
- Result: the piece leaves the room for the habbo's hand and belongs to its user, with no place left; no row changes
  when the room does not have it
- Tables: `furni`

## MoveRoomFurniToHand

- Cardinality: `:exec`
- Inputs: `room_id`, `user_id`, `avatar_id`
- Result: every piece that stands in the room goes to the habbo's hand and belongs to its user, before the room is
  deleted
- Tables: `furni`
