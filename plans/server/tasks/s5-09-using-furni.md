---
type: Task
title: Use furni
description: SETSTUFFDATA and SETITEMSTATE change a furni's state, saved; gates open, dice and bottles roll, wheels and randomizers draw, and fridges hand out drinks.
status: done
phase: s5
depends_on: [s5-08]
packages: [packages/virtual, packages/server]
client: ["packages/client-r26/src/game/hh_furni_classes/6_Active Object Extension Class.ls", "packages/client-r26/src/game/hh_furni_classes/7_Item Object Extension Class.ls", "packages/client-r26/src/game/hh_furni_classes/10_Habbo Wheel Class.ls", "packages/client-r26/src/game/hh_furni_classes/27_Furniture Fridge Class.ls", "packages/client-r26/src/game/hh_furni_classes/34_Furniture Edicehc Class.ls", "packages/client-r26/src/game/hh_furni_classes/53_Furniture Bottle Class.ls", "packages/client-r26/src/game/hh_furni_classes/55_E-Dice Class.ls", "packages/client-r26/src/game/hh_furni_classes/59_Furniture OneWayDoor Class.ls", "packages/client-r26/src/game/hh_furni_classes/65_Valentine Randomizer Class.ls", "packages/client-r26/src/game/hh_furni_classes/66_Fortune Class.ls", "packages/client-r26/src/game/hh_room_utils/23_OneWayDoor Manager Class.ls"]
timestamp: 2026-11-11T17:41:09+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-11T15:10:47+00:00"}
verified:
  - {by: claude-code/claude-fable-5-2, at: "2026-11-11T17:41:09+00:00"}
---

# Goal

Furni reacts to habbos and keeps its state ([0011](/decisions/0011-saved-and-memory-only-data.md)).

# Steps

- [x] `SETSTUFFDATA` (74) changes a floor furni's state, 88, and `SETITEMSTATE` (214) a wall item's, 85; the state is
  saved and comes back with the room.
- [x] A gate or a door furni lets habbos through while it is open, and shuts only while nobody stands in it.
- [x] `THROW_DICE` (76) rolls a dice and `DICE_OFF` (77) closes it, from a tile next to it, 90; the bottle spins with
  `THROW_DICE` too.
- [x] `SPIN_WHEEL_OF_FORTUNE` (247) and `SET_RANDOM_STATE` (314) draw a number, shown once the furni's animation ends.
- [x] `CARRYDRINK` (80) hands the habbo a drink from a fridge and its like, shown in its status.
- [x] Tests with the Go test client.

# Verification

```sh
cd packages/virtual && go vet ./... && go test ./... -race
cd packages/server && go test ./... -race
make gates
```

Results:

- `game.SetFurniState` handles `SETSTUFFDATA` (74) by Holo's rules: anyone in the room sets a floor furni's state; only
  a habbo that controls the room opens and closes a door furni, `O` and `C`, and a door closes only while nobody stands
  in it; and nobody sets a furni the server draws or writes, a dice, a bottle, the randomizer, a trophy or a present, so
  no face or inscription is forged. `game.SetItemState` handles `SETITEMSTATE` (214) for wall items, but for the wheel,
  a post-it, a poster and the room dimmer. The state is saved with `SetRoomFurniState`, then the room's copy changes,
  which lays the floor again, and the room gets 88 or 85.
- A gate that stands open lets habbos walk through it, and refuses to close on one, as
  [s5-07](/tasks/s5-07-furni-in-rooms.md)'s floor reads its state.
- `THROW_DICE` (76) rolls a dice for a habbo beside it: 90 with the id while it rolls, and two seconds later with the
  face, 1 to 6, plus 38 times the id; `DICE_OFF` (77) shows no face. A bottle spins the same way and points one of eight
  ways, which Holo left out though the client has it. `SPIN_WHEEL_OF_FORTUNE` (247) shows -1 and, 4.25 seconds later, 0
  to 9, for a habbo that controls the room; `SET_RANDOM_STATE` (314) shows the love randomizer's `123456789` and, five
  seconds later, 1 to 4. Each number is saved at once and told after its wait, while the room still has the furni.
- `CARRYDRINK` (80) puts a drink in a habbo's hand, tokens 1 to 26: `carryd` for 9 seconds, `drink` for 1, ten times,
  moved on by the room's clock; a dance or `STOP CarryItem` takes it away, and a habbo that lies takes none.
- One-way doors, `ENTER_ONEWAY_DOOR` (232), and the fortune teller, whose class also sends 314, are left to
  `plans/later.md`: Holo handled neither, its catalogue sells no one-way door, and the fortune teller's states are in
  furni data the repository does not hold.
- In `packages/server`, `go vet ./...` and `go test ./... -race` pass, with `TestUsingFurni`, a lamp, a gate, a dice,
  the wheel, the randomizer and a drink between two habbos, and in `game` `TestADrinkIsSippedTenTimes`. `make gates`
  passes.

# Notes

- Runs on the branch `s5-using-furni`.
- Chosen without asking, each as Holo had it: anyone in a room changes a furni's state, and only a habbo that controls
  the room opens a gate or spins the wheel; a dice shows its face after 2 seconds, the wheel its number after 4.25 and
  the randomizer its own after 5; a drink is carried 9 seconds and drunk 1, ten times.
- One-way doors and the fortune teller, which Holo did not handle, wait in `plans/later.md`.
