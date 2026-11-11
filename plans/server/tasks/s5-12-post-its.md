---
type: Task
title: Write post-its
description: A pad's post-its go on a wall one at a time; G_IDATA reads a note as 48, SETITEMDATA writes its colour and text, saved, and REMOVEITEM deletes it.
status: todo
phase: s5
depends_on: [s5-08]
packages: [packages/store, packages/server]
client: ["packages/client-r26/src/game/hh_furni_classes/21_PostIt Item Class.ls", "packages/client-r26/src/game/hh_furni_classes/22_PostIt Manager Class.ls", "packages/client-r26/src/game/hh_room/5_Room Handler Class.ls"]
timestamp: 2026-11-11T15:10:47+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-11T15:10:47+00:00"}
---

# Goal

Habbos leave notes on a room's walls ([hh_room](/reference/r26/hh_room.md), 48).

# Steps

- [ ] The store keeps a note's text; an update with it, queries, tests and the OKF concepts, with the
  `adding-data-persistence` skill.
- [ ] `PLACESTUFF` with a pad puts one note on the wall and takes it from the pad, which goes once it is empty.
- [ ] `G_IDATA` (83) answers 48 with the note's colour and text; `SETITEMDATA` (84) writes them, and the room sees the
  colour as 85.
- [ ] `REMOVEITEM` (85) deletes a note, and nothing picks one up.
- [ ] Tests with the Go test client.

# Verification

```sh
cd packages/store && go vet ./... && go test ./... && make check-docs
cd packages/server && go test ./... -race
make gates
```

# Notes

- Runs on the branch `s5-post-its`.
- To settle before it starts:
  - Who writes on a note and who deletes it; Holo let habbos with rights write and the owner delete. And what
    `fuse_remove_stickies` lets staff do.
  - The most characters of a note, 684 in Holo, and its colours, four in Holo.
