---
type: Task
title: Send and open presents
description: A purchase with the gift flag puts the furni in a box in the hand of the habbo named, with a note, and PRESENTOPEN gives the box's furni to its opener.
status: done
phase: s5
depends_on: [s5-05, s5-08]
packages: [packages/store, packages/server]
client: ["packages/client-r26/src/game/hh_cat_code/4_Catalogue Component Class.ls", "packages/client-r26/src/game/hh_furni_classes/57_Furniture Present Class.ls", "packages/client-r26/src/game/hh_furni_classes/58_Package Card Class.ls", "packages/client-r26/src/game/hh_room/5_Room Handler Class.ls"]
timestamp: 2026-11-11T17:33:23+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-11T15:10:47+00:00"}
verified:
  - {by: claude-code/claude-fable-5-2, at: "2026-11-11T17:33:23+00:00"}
---

# Goal

A habbo buys furni as a present for another ([0094](/decisions/0094-any-habbo-sends-a-present-to-any-habbo.md)).

# Steps

- [x] A table for what a box holds and its note; an update with it, queries, tests and the OKF concepts, with the
  `adding-data-persistence` skill.
- [x] `GPRC` with the gift flag buys for the habbo named: 76 with the name when no habbo has it, charging nothing;
  otherwise the furni waits in one of the six boxes, `present_gen1` to `present_gen6`, drawn at random, in the
  receiver's hand, and the buyer's credit history names the furni and the receiver
  ([0094](/decisions/0094-any-habbo-sends-a-present-to-any-habbo.md)).
- [x] `PRESENTOPEN` (78) on a box that stands in a room gives its furni to the opener's hand and removes the box; 129
  shows what it held.
- [x] Tests with the Go test client, a receiver who is offline among them.

# Verification

```sh
cd packages/store && go vet ./... && go test ./... && make check-docs
cd packages/server && go test ./... -race
make gates
```

Results:

- The store's `furni` gains `box_furni_id`, the present a furni waits in, with the update `0015-presents.sql`; a furni
  in a box is in no hand and no room. Queries: `ListBoxFurni`, `UnboxFurni` and `DeleteRoomFurni`, and `CreateFurni`
  takes the box.
- `game.Buy` takes a gift: the receiver is the habbo of that name, online or not; the furni, every piece of a deal too,
  waits in one box, `present_gen1` to `present_gen6` drawn at random, in the receiver's hand, and belongs to the
  receiver's user. The box's state is `!` and the note, cut at `game.presentNoteMaxLength`, 200, a setting of the Game
  form ([0106](/decisions/0106-a-presents-note-is-cut-at-200-characters.md)). The buyer's wallet pays, and its history
  reads `Catalogue purchase (<item>), a present for <name>`
  ([0094](/decisions/0094-any-habbo-sends-a-present-to-any-habbo.md)). A name that no habbo has, or an archived habbo's,
  charges nothing.
- `game.OpenPresent` opens a box that stands in the opener's own room, for the room's owner alone
  ([0105](/decisions/0105-only-a-rooms-owner-opens-a-present.md)): in one transaction what waited in it goes to the
  opener's hand and the box is deleted, then the room's copy loses the box.
- `r26` reads the gift's three lines of `GPRC` and answers a name that no habbo has with 76; `PRESENTOPEN` (78) answers
  the room with 94, and the opener with 129, the class, the class with a wall item's data and the colours of the last
  furni the box held, and with its hand at the last page, as Holo sent it. Holo wrote 129's third line as the furni's
  length, width and colours; the client reads it as colours alone, which is what the server sends.
- A receiver that is in a room gets 101, on which its client asks for its hand, where Holo sent the hand itself: the
  notice comes from the buyer's session, which must not touch the page the receiver's session keeps.
- `virtual/furni` gains `BySprite`, the first definition of a sprite.
- In `packages/store`, `go vet ./...`, `go test ./...` and `make check-docs` pass. In `packages/server`,
  `go test ./... -race` passes, with `TestAPresentWaitsInItsReceiversHand` and `TestOpeningAPresent`. `make gates`
  passes.

# Notes

- Runs on the branch `s5-presents`.
- Settled before it started: only a room's owner opens a present
  ([0105](/decisions/0105-only-a-rooms-owner-opens-a-present.md)), and a note is cut at 200 characters
  ([0106](/decisions/0106-a-presents-note-is-cut-at-200-characters.md)).
- Chosen without asking, as Holo had it: a deal can be a present, all its furni in one box; a habbo may send itself a
  present; and a receiver that is in a room sees its hand come up.
