# TICKET-031: Furniture State Machines

**Priority:** MVP-3
**Size:** L
**Affects:** Server / Client / DB
**Depends on:** TICKET-007, TICKET-008

## Summary
Implement stateful furniture interactions beyond the basic USEITEM on/off toggle. This covers: dice (THROW_DICE, 76), slot machines, teleporters (link & use), fridges (SETSTUFFDATA, 74), PostIt notes, credit furniture (CONVERT_FURNI_TO_CREDITS), trophy placement, and other complex interactive furniture from `hh_furni_classes`. Each furniture class has its own state machine; this ticket groups them together as the "furni state machines" milestone.

## Server (Go)
- Package: `internal/app/game/protocol/hh_room/` and `internal/app/game/protocol/hh_furni_classes/` (new)
- Inbound commands to implement:
  - 76 `THROW_DICE` — read `item_id int`; validate item is a dice furniture; roll random 1–6; set `extra_data` on `room_furniture` row; broadcast STUFFDATAUPDATE (88) to room with new value; send DICE_VALUE (90) to the initiator
  - 74 `SETSTUFFDATA` — read `item_id int`, `data string`; used for PostIt color/text, Fridge item placement, and other data-driven furniture; validate user has rights; update `extra_data` on `room_furniture`; broadcast STUFFDATAUPDATE (88) to room
  - 89 `USEITEM` (extended) — already in TICKET-008; here, add class-specific handlers:
    - `teleport` class: link teleporter, initiate teleport (see TICKET-029)
    - `slot_machine` class: roll outcome, set state
    - `fridge` class: open/close toggle + item placement via SETSTUFFDATA
    - `wheel_of_fortune` class: spin, broadcast result to room
    - `credit_furni` class: see below
  - 75 `CONVERT_FURNI_TO_CREDITS` — read `item_id int`; validate item class is credit furniture; look up credit value from furniture definition; remove item from `room_furniture` and `furniture_inventory`; add credits to `users_avatar.credits`; send PURSE (6) update to session
- Outbound commands to register:
  - 88 `STUFFDATAUPDATE` — `item_id int`, `extra_data string`; broadcast state change to all room users
  - 90 `DICE_VALUE` — `item_id int`, `value int` (1–6 or 0 for no-roll); sent to room on throw
- DB changes needed:
  - `room_furniture.extra_data TEXT` — already planned in TICKET-007; used for state storage
  - `furniture_definitions`: add `is_stackable BOOL`, `credit_value INT DEFAULT 0` columns
  - Add sqlc query: `UpdateFurnitureExtraData`
- Virtual state changes:
  - `pkg/virtual/room.go`: `FloorItem` struct needs `ExtraData string` field
  - Add a `FurniInteractionHandler` interface: `HandleUse(item *FloorItem, user *Habbo) error` — implement per furniture class

## Client (Godot)
- Scene/script: `client/hh_furni_classes/`
- Reference: `casts/hh_furni_classes/` — individual furniture class scripts (teleport, fridge, TV, PostIt, wheel, credit furni)
- What to implement:
  - Each furniture class has a GDScript that handles its visual state transitions based on STUFFDATAUPDATE (88)
  - Dice: on THROW_DICE, play rolling animation; on STUFFDATAUPDATE, display the rolled value
  - Dice value `0` (from DICE_VALUE with 0): show dice as "not thrown yet" (blank face)
  - PostIt: on SETSTUFFDATA, show a text overlay on the PostIt furni node with the note text; color changes from `extra_data`
  - Credit furni: show credit value overlay; on CONVERT_FURNI_TO_CREDITS, remove from room and update credits display
  - Slot machine: spin animation, then lock on the result state from STUFFDATAUPDATE
  - Wheel of fortune: spin and land on segment matching STUFFDATAUPDATE result
  - Reference per class: `casts/hh_furni_classes/4_Teleport Class.ls`, `5_Fridge Class.ls`, `6_TV Class.ls`, `8_PostIt Class.ls`, `9_Wheel Class.ls`, `10_Credit Furni Class.ls`

## Acceptance criteria
- [ ] THROW_DICE (76) rolls a random 1–6; STUFFDATAUPDATE broadcasts result to room
- [ ] DICE_VALUE (90) shows the numeric result on the dice visually
- [ ] SETSTUFFDATA (74) on a PostIt updates the text/color; change is visible to all room users
- [ ] USEITEM on a teleporter initiates teleport flow (see TICKET-029)
- [ ] CONVERT_FURNI_TO_CREDITS removes the furniture item and adds the defined credit value
- [ ] PURSE (6) update is sent to the user after credit conversion
- [ ] Furniture extra_data state is persisted to DB and restored on room load
- [ ] Slot machine/wheel states are broadcast as STUFFDATAUPDATE

## Notes
- This ticket is deliberately large (L) because it touches many furniture classes. Break implementation into sub-tasks: dice first (simplest), then PostIt, then credit furni, then teleporter, then slot/wheel.
- Credit furniture `credit_value` must be defined per furniture class in `furniture_definitions` — seed from a DB migration based on the original Habbo economy.
- SETSTUFFDATA is used by many furniture types; the handler should dispatch to a per-class handler by looking up the furniture's `class_name` in `furniture_definitions`.
