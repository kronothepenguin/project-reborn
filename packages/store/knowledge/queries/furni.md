---
type: SQL Query
title: furni.query.sql
description: Furni operations that create and read a piece, list a habbo's hand a page at a time and a room's furni, place, move and pick up furni, open a present and save a furni's state.
resource: packages/store/queries/furni.query.sql
tags: [store, query, furni]
timestamp: 2026-11-11T16:24:23+00:00
---

# Operations

## CreateFurni

- Cardinality: `:one`
- Inputs: `furni_definition_id`, `user_id`, `avatar_id` (none for the shared inventory or a present),
  `box_furni_id` (the box of a present, or none), `state`, `created_at`
- Result: the new piece, in the habbo's hand, in a present or in the user's shared inventory
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

## ListBoxFurni

- Cardinality: `:many`
- Inputs: `box_furni_id`
- Result: the furni that waits in the present, by id
- Tables: `furni`

## UnboxFurni

- Cardinality: `:exec`
- Inputs: `box_furni_id`, `user_id`, `avatar_id`
- Result: what waited in the present goes to the habbo's hand and belongs to its user
- Tables: `furni`

## DeleteRoomFurni

- Cardinality: `:execrows`
- Inputs: `id`, `room_id`
- Result: the piece that stands in the room is deleted, as an opened present's box is; no row changes when the room
  does not have it
- Tables: `furni`

## SetRoomFurniState

- Cardinality: `:execrows`
- Inputs: `id`, `room_id`, `state`
- Result: the piece that stands in the room takes the state; no row changes when the room does not have it
- Tables: `furni`

## DeleteHandFurni

- Cardinality: `:execrows`
- Inputs: `id`, `avatar_id`
- Result: the piece leaves the habbo's hand for good, as a wallpaper used on a room does; no row changes when the
  hand does not hold it
- Tables: `furni`
