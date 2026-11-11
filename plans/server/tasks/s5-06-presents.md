---
type: Task
title: Send and open presents
description: A purchase with the gift flag puts the furni in a box in the hand of the habbo named, with a note, and PRESENTOPEN gives the box's furni to its opener.
status: todo
phase: s5
depends_on: [s5-05, s5-08]
packages: [packages/store, packages/server]
client: ["packages/client-r26/src/game/hh_cat_code/4_Catalogue Component Class.ls", "packages/client-r26/src/game/hh_furni_classes/57_Furniture Present Class.ls", "packages/client-r26/src/game/hh_furni_classes/58_Package Card Class.ls", "packages/client-r26/src/game/hh_room/5_Room Handler Class.ls"]
timestamp: 2026-11-11T15:10:47+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-11T15:10:47+00:00"}
---

# Goal

A habbo buys furni as a present for another ([0094](/decisions/0094-any-habbo-sends-a-present-to-any-habbo.md)).

# Steps

- [ ] A table for what a box holds and its note; an update with it, queries, tests and the OKF concepts, with the
  `adding-data-persistence` skill.
- [ ] `GPRC` with the gift flag buys for the habbo named: 76 with the name when no habbo has it, charging nothing;
  otherwise the furni waits in one of the six boxes, `present_gen1` to `present_gen6`, drawn at random, in the
  receiver's hand, and the buyer's credit history names the furni and the receiver
  ([0094](/decisions/0094-any-habbo-sends-a-present-to-any-habbo.md)).
- [ ] `PRESENTOPEN` (78) on a box that stands in a room gives its furni to the opener's hand and removes the box; 129
  shows what it held.
- [ ] Tests with the Go test client, a receiver who is offline among them.

# Verification

```sh
cd packages/store && go vet ./... && go test ./... && make check-docs
cd packages/server && go test ./... -race
make gates
```

# Notes

- Runs on the branch `s5-presents`.
- To settle before it starts:
  - The most characters of a note.
  - Whether a deal can be a present, all its furni in one box, as Holo did.
  - Who opens a box; Holo let only the room's owner, in its own room.
