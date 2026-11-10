---
type: SQL Query
title: rooms.query.sql
description: Room operations: rights, bans, votes and the rating, the chat history, and a habbo's ignore list.
resource: packages/store/queries/rooms.query.sql
tags: [store, query, rooms]
timestamp: 2026-11-10T16:46:21+00:00
---

# Operations

## ListRoomRights

- Cardinality: `:many`
- Inputs: `room_id`
- Result: the habbos with rights in the room, first given first
- Tables: `room_rights`

## HasRoomRights

- Cardinality: `:one`
- Inputs: `room_id`, `avatar_id`
- Result: whether the habbo has rights in the room
- Tables: `room_rights`

## AddRoomRights

- Cardinality: `:exec`
- Inputs: `room_id`, `avatar_id`, `granted_at`
- Result: the rights, or nothing when the habbo has them
- Tables: `room_rights`

## RemoveRoomRights

- Cardinality: `:execrows`
- Inputs: `room_id`, `avatar_id`
- Result: 1 when the habbo had rights
- Tables: `room_rights`

## RemoveAllRoomRights

- Cardinality: `:many`
- Inputs: `room_id`
- Result: the habbos who lost their rights
- Tables: `room_rights`

## BanFromRoom

- Cardinality: `:exec`
- Inputs: `room_id`, `avatar_id`, `expires_at`
- Result: the ban; a new one replaces an older one
- Tables: `room_bans`

## GetRoomBanEnd

- Cardinality: `:one`
- Inputs: `room_id`, `avatar_id`, `now`
- Result: the end of the habbo's ban while it holds; not found otherwise
- Tables: `room_bans`

## DeleteExpiredRoomBans

- Cardinality: `:execrows`
- Inputs: `now`
- Result: how many ended bans went
- Tables: `room_bans`

## AddRoomVote

- Cardinality: `:execrows`
- Inputs: `room_id`, `avatar_id`, `vote`, `voted_at`
- Result: 1 for a first vote, 0 when the habbo voted already
- Tables: `room_votes`

## HasVotedOnRoom

- Cardinality: `:one`
- Inputs: `room_id`, `avatar_id`
- Result: whether the habbo voted on the room
- Tables: `room_votes`

## GetRoomRating

- Cardinality: `:one`
- Inputs: `room_id`
- Result: the sum of the votes and their count
- Tables: `room_votes`

## AddChatMessage

- Cardinality: `:exec`
- Inputs: `public_room_id`, `room_id`, `avatar_id`, `kind`, `to_avatar_id`, `text`, `said_at`
- Result: the line
- Tables: `chat_messages`

## DeleteChatMessagesBefore

- Cardinality: `:execrows`
- Inputs: `before`
- Result: how many lines older than `before` went
- Tables: `chat_messages`

## ListIgnoredHabbos

- Cardinality: `:many`
- Inputs: `avatar_id`
- Result: the habbos it ignores with their names, first ignored first
- Tables: `ignored_habbos`, `avatars`

## IgnoreHabbo

- Cardinality: `:exec`
- Inputs: `avatar_id`, `ignored_avatar_id`, `created_at`
- Result: the habbo ignored, or nothing when it is already
- Tables: `ignored_habbos`

## UnignoreHabbo

- Cardinality: `:execrows`
- Inputs: `avatar_id`, `ignored_avatar_id`
- Result: 1 when the habbo was ignored
- Tables: `ignored_habbos`

# Related

- Entities: [Room](/entities/room.md), [Chat message](/entities/chat-message.md) and [Habbo](/entities/habbo.md).
