---
type: Phase
title: S4 Rooms
description: Habbos enter rooms, see each other, walk, talk and act, and owners manage rights, the doorbell, kicks and bans.
status: active
timestamp: 2026-11-10T16:42:26+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T20:57:45+00:00"}
tags: [s4, server]
---

# Goal

Habbos enter public and private rooms, see each other, walk, talk, dance and wave. Owners give rights, answer the
doorbell, kick and ban, and habbos rate rooms, ignore others and hold room events.

# Scope

| Client | Reference | Parts |
| --- | --- | --- |
| `hh_room` | [s1-06](/tasks/s1-06-room.md) | Entering and leaving, the heightmap, habbos and their status, walking, chat, dance and wave, rights, the doorbell, kicks and bans, rating, ignoring, typing, room events, spectators and the queue, group badges, tags |
| `hh_room_utils` | [s1-07](/tasks/s1-07-room-utils.md) | Dialogs, one-way doors, the chat manager |

- Saved: room rights, bans, chat history, rating and ignore lists. Only in memory: positions, loaded rooms and room
  events ([0011](/decisions/0011-saved-and-memory-only-data.md)).
- Habbos walk a step every 500 ms by Holo's rules ([0065](/decisions/0065-walking-500-ms-by-holos-rules.md)); staff
  read the chat history, kept 30 days ([0066](/decisions/0066-staff-read-the-chat-history-30-days.md)); a room ban
  lasts 15 minutes ([0067](/decisions/0067-a-room-ban-lasts-15-minutes.md)); a habbo shows its favourite group's badge
  ([0068](/decisions/0068-a-habbo-shows-its-favourite-groups-badge.md)); the doorbell, the queue and the spectators
  live only in memory ([0069](/decisions/0069-doorbell-queue-and-spectators-in-memory.md)); rooms show a loading ad and
  a room ad from settings ([0070](/decisions/0070-a-loading-ad-and-a-room-ad-from-settings.md)); an empty room unloads
  at once ([0071](/decisions/0071-an-empty-room-unloads-at-once.md)); each loaded room runs its own clock
  ([0072](/decisions/0072-each-loaded-room-runs-its-own-clock.md)); each session sends through an outbox
  ([0073](/decisions/0073-each-session-sends-through-an-outbox.md)).
- Furni in rooms, trading and teleports are [S5](/phases/s5-furni-catalogue.md)'s; pets and photos
  [S7](/phases/s7-club-help-extras.md)'s.

# Exit criteria

- Go test clients enter a public room and a habbo room, see each other, walk a step every 500 ms around walls and
  heights without cutting corners, chat, whisper and shout, type, dance and wave, and leave.
- An owner's room asks for its password, rings its doorbell and refuses a full room or a banned habbo; the owner gives
  and takes rights, answers the doorbell, kicks, and bans for 15 minutes.
- A habbo rates a room, ignores another, holds a room event, and shows its badge and its favourite group's.
- The chat is saved, staff read it in housekeeping, and lines older than 30 days go.
- The loading ad and the room ad come from housekeeping's settings, and an empty room unloads at once.
- Every gate passes.

# Tasks

1. [s4-01 Add the rooms' saved data](/tasks/s4-01-room-tables.md) **done**
2. [s4-02 Load and unload rooms in virtual](/tasks/s4-02-loaded-rooms.md) **done**
3. [s4-03 Enter and leave a room](/tasks/s4-03-entering-a-room.md) **done**
4. [s4-04 Walk](/tasks/s4-04-walking.md) **done**
5. [s4-05 Chat, whisper, shout, dance, wave and type](/tasks/s4-05-chat-and-gestures.md) **done**
6. [s4-06 Give rights, kick and ban](/tasks/s4-06-rights-kicks-and-bans.md) **done**
7. [s4-07 Rate rooms, hold events, and show groups and tags](/tasks/s4-07-room-extras.md) **done**
8. [s4-08 Read the chat history in housekeeping](/tasks/s4-08-chat-log-page.md) **done**
9. [s4-09 Check S4's exit criteria](/tasks/s4-09-exit-check.md)
10. [s4-10 Send through an outbox per session](/tasks/s4-10-outbox.md) **done**
11. [s4-11 Wear five badges](/tasks/s4-11-five-badge-slots.md) **done**
12. [s4-12 Queue for full rooms and watch as a spectator](/tasks/s4-12-queue-and-spectators.md) **done**
