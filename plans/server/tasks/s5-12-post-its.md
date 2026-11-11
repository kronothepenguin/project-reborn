---
type: Task
title: Write post-its
description: A pad's post-its go on a wall one at a time; G_IDATA reads a note as 48, SETITEMDATA writes its colour and text, saved, and REMOVEITEM deletes it.
status: done
phase: s5
depends_on: [s5-08]
packages: [packages/store, packages/server]
client: ["packages/client-r26/src/game/hh_furni_classes/21_PostIt Item Class.ls", "packages/client-r26/src/game/hh_furni_classes/22_PostIt Manager Class.ls", "packages/client-r26/src/game/hh_room/5_Room Handler Class.ls"]
timestamp: 2026-11-11T18:12:18+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-11T15:10:47+00:00"}
verified:
  - {by: claude-code/claude-fable-5-2, at: "2026-11-11T18:12:18+00:00"}
---

# Goal

Habbos leave notes on a room's walls ([hh_room](/reference/r26/hh_room.md), 48).

# Steps

- [x] The store keeps a note's text; an update with it, queries, tests and the OKF concepts, with the
  `adding-data-persistence` skill.
- [x] `PLACESTUFF` with a pad puts one note on the wall and takes it from the pad, which goes once it is empty.
- [x] `G_IDATA` (83) answers 48 with the note's colour and text; `SETITEMDATA` (84) writes them, and the room sees the
  colour as 85.
- [x] `REMOVEITEM` (85) deletes a note, and nothing picks one up.
- [x] Tests with the Go test client.

# Verification

```sh
cd packages/store && go vet ./... && go test ./... && make check-docs
cd packages/server && go test ./... -race
make gates
```

Results:

- The store gains `furni_notes`, what is written on a post-it, with the update `0018-post-its.sql`, and the queries
  `GetFurniNote`, `SetFurniNote`, `SetHandFurniState` and `DeleteRoomPostIts`. A post-it's colour is its furni's state,
  and a pad counts its notes in its own.
- `PLACESTUFF` with a pad hangs one note, as Holo did: in one transaction the pad counts one fewer, or goes with its
  last note, and the note is a new furni of the pad's kind, yellow, of the placer's user. The room gets 83, and the
  placer 101, so that its hand shows the pad's count.
- `G_IDATA` (83) answers 48, `<id>` TAB `<colour> <text>`, to anyone in the room. `SETITEMDATA` (84) lets a habbo that
  controls the room write the colour and the text, saved together; the room gets 85. A `post.it` takes the four colours
  of the client's window, and a text longer than the new setting `game.postItMaxLength`, 684, is refused
  ([0108](/decisions/0108-rights-write-notes-owner-and-staff-delete.md),
  [0109](/decisions/0109-post-it-length-is-a-setting.md)). Housekeeping's Game form has the setting.
- `REMOVEITEM` (85) deletes a post-it for the room's owner or a holder of `fuse_remove_stickies`; the room gets 84. A
  post-it is never picked up, and a deleted room's post-its are deleted with it.
- `plans/later.md` gained "A room's most post-its and rollers": the client's alerts 403 and 404, which nothing sends.
- In `packages/store`, `go vet ./...`, `go test ./...` and `make check-docs` pass. In `packages/server`,
  `go test ./... -race` passes, with `TestPostIts` and `TestADeletedRoomsPostItsGo`. `make gates` passes.

# Notes

- Runs on the branch `s5-post-its`.
- Settled before it started: habbos with rights write, the owner and staff holding `fuse_remove_stickies` delete
  ([0108](/decisions/0108-rights-write-notes-owner-and-staff-delete.md)), and a note's longest text is the setting
  `game.postItMaxLength`, 684 ([0109](/decisions/0109-post-it-length-is-a-setting.md)).
- Chosen without asking: a note's text is kept in a table of its own, `furni_notes`, as Holo's `furniture_stickies`, so
  that a room's copy of its furni does not carry every note's text; a deleted room's post-its are deleted with it, since
  a note never comes into a hand; the placer gets 101 after each note, which Holo never sent, so that its hand shows the
  pad's count; a `post.it.vd` takes any six hexadecimal digits as its colour, as Holo let it; and Holo's swear-word
  filter is left out, as it is for chat.
- Found on the way: the client has alerts for a room's most post-its (403) and most rollers (404), which Holo never
  sent. Nothing sends them.
