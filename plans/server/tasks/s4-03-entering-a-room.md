---
type: Task
title: Enter and leave a room
description: A habbo enters a public room or a habbo room past its door, its password, its ban or its doorbell, gets the room's map, habbos, objects and statuses, and leaves; the loading ad and the room ad come from settings.
status: done
phase: s4
depends_on: [s4-02, s4-10]
packages: [packages/server]
client: ["packages/client-r26/src/game/hh_room/4_Room Component Class.ls", "packages/client-r26/src/game/hh_room/5_Room Handler Class.ls"]
timestamp: 2026-11-10T17:39:27+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-10T16:42:08+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-10T17:39:27+00:00"}
---

# Goal

A habbo enters and leaves rooms ([hh_room](/reference/r26/hh_room.md), Entering a room).

# Steps

- [x] `#room_directory` (2) enters a public room by its port, or goes on with 19 in a habbo room; `TRYFLAT` (57)
  answers by the door: 41 for an open one; 91 for a closed one, while those with rights get 91 with the name and answer
  with `LETUSERIN` (98), 41 or 131; a password compared with the hash
  ([0062](/decisions/0062-room-passwords-are-hashed.md)), or 33 `Incorrect flat password`. A banned habbo gets 224 with
  4, a full room 224 with 1. `GOTOFLAT` (59) brings 69 with the model, and 42, 43 and 47 for the habbo's rights.
- [x] `G_HMAP` (31), `G_USRS` (28), `G_OBJS` (30, a public room's furni), `G_ITEMS` (45) and the furniture (32), none
  until S5, and `G_STAT` (34); the room's habbos get the newcomer in 28 and 34.
- [x] `QUIT` (53), a closed session, or another room's entry takes the habbo out, and the others get 29.
- [x] `GETINTERST` (182) gets 258 and `GETROOMAD` (126) 208 from the settings
  ([0070](/decisions/0070-a-loading-ad-and-a-room-ad-from-settings.md)).
- [x] Tests with the Go test client.

# Verification

```sh
cd packages/server && go test ./... -race
make gates
```

Results:

- `r26/room.go` serves hh_room's entry, as `packages/server/README.md`'s Rooms section lists it: `GETINTERST` and
  `GETROOMAD` answer 258 and 208 from the settings, or `0` for none
  ([0070](/decisions/0070-a-loading-ad-and-a-room-ad-from-settings.md)); `#room_directory` answers 19, as Holo did
  for both kinds, then a public room's 69 `<model> <id>`; `TRYFLAT` answers 41, 91, 131, 33 `Incorrect flat password`
  or 224 with 1 (full) or 4 (banned); `LETUSERIN` answers the doorbell; `GOTOFLAT` sends 69 `model_<model> <id>`, then
  47 for the owner and 42 for a habbo with rights; `G_HMAP`, `G_USRS`, `G_OBJS` with 32, `G_ITEMS` and `G_STAT`
  build the room; `QUIT` leaves it.
- The rules are `game/entering.go`'s: the owner and the holders of `fuse_enter_locked_rooms` pass any door and any
  ban, as Holo had it; a password door compares with the hash
  ([0062](/decisions/0062-room-passwords-are-hashed.md)); a closed door rings the habbos with rights in the room. A
  room that is not loaded turns the ringer away at once, as Holo did, and so does a loaded room with nobody inside who
  may answer, where Holo let the ringer wait for nobody.
- The client's ids are the reference's, not Holo's: Holo answered 60 with the height map and the users and 61 with the
  objects, from another version of the client. The habbo comes in at `G_STAT`, once its client built the room, as
  Holo had it, and the room's limit is checked again then; the owner's status holds `flatctrl useradmin` and a habbo
  with rights `flatctrl onlyfurniture`. User lines end each line with a carriage return, where Holo ran one user's
  badges into the next user's index. 43 waits for [s4-06](/tasks/s4-06-rights-kicks-and-bans.md), which takes rights.
- The way into a room is a `room.Heading` in `virtual/room`, memory only
  ([0069](/decisions/0069-doorbell-queue-and-spectators-in-memory.md)): `#room_directory` heads the habbo for the
  room, its door admits it, `Admit` only into the room it still heads for, and only an admitted habbo builds or enters
  the room. The loaded room keeps its owner.
- A habbo leaves its room on `QUIT`, on `#room_directory`, when its session ends and on a second login, which takes the
  old session out before it ends; the others get 29, and the last one out unloads the room
  ([0071](/decisions/0071-an-empty-room-unloads-at-once.md)), turning away those still ringing. A ringer that leaves
  drops out of the doorbells with 131 and its name. Deleting a room sends the habbos in it out with 18, as Holo did.
- `GETSPACENODEUSERS` now names the habbos in a public room, by index, as Holo listed them, where S3 sent none.
- Room ratings and events, which Holo sent with 69, wait for [s4-07](/tasks/s4-07-room-extras.md); wallpapers, floors
  and landscapes, 46, for S5.
- In `packages/server`, `go vet ./...` and `go test ./... -race` pass, with `TestTwoHabbosMeetInAPublicRoom`,
  `TestEnteringAHabboRoom`, `TestAPasswordDoor`, `TestTheDoorbell`, `TestABannedHabboAndAFullRoom`,
  `TestDeletingARoomSendsItsHabbosOut`, `TestLoggingOutLeavesTheRoom` and `TestTheAdsComeFromTheSettings`, three times
  in separate runs; `packages/virtual` passes with `TestAHabboIsAdmittedOnlyWhereItHeads`.

# Notes

- Runs on the branch `s4-entering-a-room`.
