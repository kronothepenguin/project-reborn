---
type: Reference
title: The hand
description: How the server serves a habbo's hand with GETSTRIP, read from the store each time.
tags: [server]
---

`room_hand.go` serves the hand, the furni a habbo carries, which hh_room's
Room Handler asks for ([hh_room](/r26/hh_room.md)):

| Command | Answer |
| --- | --- |
| `GETSTRIP` (65) | 140: a page of the hand, nine furni, the oldest first. `new` gives the first page, `next` and `prev` the one after and before, stopping at the last and the first, and `update` the same page again |

- The hand lives in the store, and every `GETSTRIP` reads it there, so what the
  site or another habbo gives shows the next time the hand opens
  (`knowledge/decisions/server/0096-the-hand-is-read-from-the-database.md`). Only
  the page the client is on lives in the session.
- 140 carries each furni ended by a slash, its values separated by the
  character 30: `SI`, the strip id, the place in the whole hand from 0, `S` or
  `I`, the id and the class; then for a floor furni, `S`, its length, width,
  state, colours and 1 when it is recyclable, and for a wall item, `I`, its
  state when it has one, so a pad shows its count, else its data, a poster's number, and 1 when it is recyclable.
  A trade lists its furni the same way. After a carriage
  return comes how many furni the hand holds, from which the client lights its
  next button. The strip id is the furni's id.
- A slash or a control character in a value becomes a space, so no state
  breaks the list.
