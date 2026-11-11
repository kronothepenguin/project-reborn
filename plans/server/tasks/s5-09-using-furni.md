---
type: Task
title: Use furni
description: SETSTUFFDATA and SETITEMSTATE change a furni's state, saved; gates open, dice and bottles roll, wheels and randomizers draw, and fridges hand out drinks.
status: todo
phase: s5
depends_on: [s5-08]
packages: [packages/virtual, packages/server]
client: ["packages/client-r26/src/game/hh_furni_classes/6_Active Object Extension Class.ls", "packages/client-r26/src/game/hh_furni_classes/7_Item Object Extension Class.ls", "packages/client-r26/src/game/hh_furni_classes/10_Habbo Wheel Class.ls", "packages/client-r26/src/game/hh_furni_classes/27_Furniture Fridge Class.ls", "packages/client-r26/src/game/hh_furni_classes/34_Furniture Edicehc Class.ls", "packages/client-r26/src/game/hh_furni_classes/53_Furniture Bottle Class.ls", "packages/client-r26/src/game/hh_furni_classes/55_E-Dice Class.ls", "packages/client-r26/src/game/hh_furni_classes/59_Furniture OneWayDoor Class.ls", "packages/client-r26/src/game/hh_furni_classes/65_Valentine Randomizer Class.ls", "packages/client-r26/src/game/hh_furni_classes/66_Fortune Class.ls", "packages/client-r26/src/game/hh_room_utils/23_OneWayDoor Manager Class.ls"]
timestamp: 2026-11-11T15:10:47+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-11T15:10:47+00:00"}
---

# Goal

Furni reacts to habbos and keeps its state ([0011](/decisions/0011-saved-and-memory-only-data.md)).

# Steps

- [ ] `SETSTUFFDATA` (74) changes a floor furni's state, 88, and `SETITEMSTATE` (214) a wall item's, 85; the state is
  saved and comes back with the room.
- [ ] A gate or a door furni lets habbos through while it is open, and shuts only while nobody stands in it.
- [ ] `THROW_DICE` (76) rolls a dice and `DICE_OFF` (77) closes it, from a tile next to it, 90; the bottle spins with
  `THROW_DICE` too.
- [ ] `SPIN_WHEEL_OF_FORTUNE` (247) and `SET_RANDOM_STATE` (314) draw a number, shown once the furni's animation ends.
- [ ] `CARRYDRINK` (80) hands the habbo a drink from a fridge and its like, shown in its status.
- [ ] Tests with the Go test client.

# Verification

```sh
cd packages/virtual && go vet ./... && go test ./... -race
cd packages/server && go test ./... -race
make gates
```

# Notes

- Runs on the branch `s5-using-furni`.
- To settle before it starts:
  - Who changes a furni's state, a habbo with rights or anyone, and for which furni.
  - The waits; Holo showed a dice's number after 2 seconds, the wheel's after 4.25 and the randomizer's after 5.
  - How long a habbo carries a drink, and how it drinks it.
  - One-way doors, `ENTER_ONEWAY_DOOR` (232) and 312 ([hh_room_utils](/reference/r26/hh_room_utils.md#one-way-doors)):
    the client has them, and Holo's catalogue sells none.
