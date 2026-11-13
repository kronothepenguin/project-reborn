---
type: SQL Update
title: 0011-room-life.sql
description: Creates room_rights, room_bans, room_votes, chat_messages and ignored_habbos, and grants housekeeping.chatLogs to every group and user that manages access.
resource: packages/store/migrations/0011-room-life.sql
tags: [store, update, rooms]
timestamp: 2026-11-10T16:46:21+00:00
---

# Update

| | |
|---|---|
| Title | Room rights, room bans, room votes, the chat history and the ignore lists, and the attribute that reads the chat history. |
| Automatic | no |

Creates [room_rights](/tables/room_rights.md), [room_bans](/tables/room_bans.md), [room_votes](/tables/room_votes.md),
[chat_messages](/tables/chat_messages.md) and [ignored_habbos](/tables/ignored_habbos.md), and adds
`housekeeping.chatLogs` to the rows of [access_group_attributes](/tables/access_group_attributes.md) and
[user_attributes](/tables/user_attributes.md) of those holding `housekeeping.accessGroups`, as a new attribute goes
(`knowledge/decisions/server/0066-staff-read-the-chat-history-30-days.md`).
