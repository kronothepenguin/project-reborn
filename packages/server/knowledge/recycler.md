---
type: Reference
title: The recycler
description: The hh_recycler commands the server answers, from the configuration to a confirmed recycling.
tags: [server]
---

`recycler.go` serves hh_recycler ([hh_recycler](/r26/hh_recycler.md)),
whose rewards and recyclings live in the store
(`knowledge/decisions/server/0093-a-recycling-is-saved.md`):

| Command | Answer |
| --- | --- |
| `GET_FURNI_RECYCLER_CONFIGURATION` (222) | 303: 1, the minutes a furni must be old, a recycling takes and its reward waits, from the settings `recycler.minOwnedMinutes`, `recycler.sessionMinutes` and `recycler.timeoutMinutes`, then each reward of `recycler_rewards`: how many furni it takes, 0 for a floor furni or 1 for a wall item, its class and, for a floor furni, 0, its length, its width and its colours. Only 0 while `recycler.enabled` is off |
| `GET_FURNI_RECYCLER_STATUS` (223) | 304: 0 with no recycling; 1, the reward's type and class and the minutes left while it runs; 2 with the reward once it may be taken; 3 once it waited too long. The time counts from the saved start |
| `START_FURNI_RECYCLING` (225) | 306, 1 when the recycling started and 0 when not, after 101 for the hand. The habbo must be in a room and recycle nothing yet (`knowledge/decisions/server/0118-a-recycling-starts-in-a-room.md`); a reward must take exactly that many furni; and each furni must be in its hand, recyclable, on offer in no trade and old enough (`knowledge/decisions/server/0117-the-recycler-checks-a-furnis-age.md`). All of them move, or none |
| `CONFIRM_FURNI_RECYCLING` (226) | 307, 1 when the recycling ended and 0 when nothing changed. 1 takes a ready reward: the furni given are destroyed and the reward is in the hand. 0 refuses it at any time, and the furni come back; after the time-out that is all that works (`knowledge/decisions/server/0116-a-recycling-that-waits-too-long-gives-the-furni-back.md`) |

- `APPROVE_RECYCLED_FURNI` (224) is never sent by the client, and has no
  handler.
