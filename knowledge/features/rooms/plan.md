---
type: Plan
title: "Rooms: how"
description: The game server runs each loaded room in memory with its own clock, and saves rights, bans, chat, ratings and ignore lists in the store.
---

# Architecture

Built:

| Project | Part |
| --- | --- |
| `packages/server` | `room.go` and `room_utils.go` answer the room; `game` holds its rules; a clock per loaded room |
| `packages/virtual` | `room` holds the loaded rooms: habbos, rights, bans, doorbell, queue, spectators and event |
| `packages/store` | Room rights, bans, the chat history, ratings and ignore lists |
| `packages/housekeeping` | The Game form edits the ads and the room limits |

Planned:

Written when the feature starts, with what [presence and rooms](/features/presence-and-rooms/spec.md) holds.

# Decisions

- [Slices follow the hotel's own features, and habbos comes
  first](/decisions/reborn/0010-slices-follow-the-hotels-features.md) — The economy and club are separate slices, furni
  with its catalogue is furnis, friends is the messenger, and habbos, rooms and navigator are slices of their own; the
  habbos slice is the first feature built, end to end from the site to the client.
- [Habbos walk a step every 500 ms, by Holo's rules](/decisions/server/0065-walking-500-ms-by-holos-rules.md) — Eight
  directions, no corner cut, up or down at most 1 height.
- [Staff read the chat history in housekeeping, and it is kept 30
  days](/decisions/server/0066-staff-read-the-chat-history-30-days.md) — The chat is saved, and lines older than 30 days
  go.
- [A room ban lasts 15 minutes](/decisions/server/0067-a-room-ban-lasts-15-minutes.md) — A setting, as Holo's ban.
- [A habbo shows its favourite group's badge in
  rooms](/decisions/server/0068-a-habbo-shows-its-favourite-groups-badge.md) — The site's favourite group, or none.
- [The doorbell, the room queue and the spectators live only in
  memory](/decisions/server/0069-doorbell-queue-and-spectators-in-memory.md) — Kept as positions are.
- [Rooms show a loading ad and a room ad from housekeeping's
  settings](/decisions/server/0070-a-loading-ad-and-a-room-ad-from-settings.md) — An image and a link each; empty shows
  none.
- [An empty room unloads at once](/decisions/server/0071-an-empty-room-unloads-at-once.md) — The next habbo in loads it
  again from the store.
- [Each loaded room runs its own clock](/decisions/server/0072-each-loaded-room-runs-its-own-clock.md) — Every 500 ms it
  moves its walking habbos and sends one status message.
- [Each session sends through an outbox](/decisions/server/0073-each-session-sends-through-an-outbox.md) — A full queue
  of 500 messages closes a client that stopped reading.
- [Near habbos read chat, far ones see a bubble](/decisions/server/0074-near-habbos-read-chat-far-ones-see-a-bubble.md)
  — 5 tiles each way; shouts reach everyone.
- [Talking, smileys and waves animate as Holo did](/decisions/server/0075-talking-smileys-and-waves-as-holo.md) — Talk
  for (letters + 50) x 30 ms, a smiley 5 s, a wave 1.5 s.
- [A habbo ignores up to 100 habbos, the oldest dropped](/decisions/server/0076-ignore-up-to-100-the-oldest-dropped.md)
  — One more drops the oldest.
- [The word filter waits for a task of its own](/decisions/server/0077-the-word-filter-waits.md) — Chat goes unfiltered
  for now.
- [A chat line is cut at 100 characters](/decisions/server/0078-a-chat-line-is-cut-at-100-characters.md) — The first 100
  are shown and saved.
- [A kicked or banned habbo walks out](/decisions/server/0079-a-kicked-habbo-walks-out.md) — It walks to the door, or
  leaves at once when it cannot reach it.
- [Full rooms queue habbos and take spectators in
  S4](/decisions/server/0080-full-rooms-queue-and-take-spectators-in-s4.md) — The client's queue and spectator mode are
  built.
- [Rooms have 11 event types, as Holo](/decisions/server/0081-eleven-room-event-types.md) — Only the owner hosts, one
  event at a time, until it leaves.
- [A room's rating is the sum of its votes and the share of
  +1](/decisions/server/0082-a-rating-is-the-sum-and-the-share-of-up-votes.md) — Shown to those who voted.
- [Every full room queues its arrivals](/decisions/server/0087-every-full-room-queues.md) — Public rooms and habbo rooms
  alike.
- [Club members come first in a queue](/decisions/server/0088-club-members-first-in-a-queue.md) — Two lines, club first.
- [Up to 50 spectators watch a full room, from its queue](/decisions/server/0089-up-to-50-spectators-from-the-queue.md)
  — A waiting habbo switches to the spectators' line.
- [The queue sets are room and spectators](/decisions/server/0090-queue-sets-room-and-spectators.md) — Names the
  client's texts take as keys.
