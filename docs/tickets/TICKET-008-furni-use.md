# TICKET-008: Furniture Interactions

**Priority:** MVP-2
**Size:** M
**Affects:** Server / Client
**Depends on:** TICKET-007

## Summary
Implement the use/activate interaction for furniture items so that double-clicking a furni item triggers its state machine. The client sends USEITEM (89) or SETSTUFFDATA (74); the server advances the furniture's state and broadcasts STUFFDATAUPDATE (88) or ACTIVEOBJECT_UPDATE (95) to all room visitors. This covers sitting on chairs/sofas, toggling on/off items (gates, lamps), dice rolling, and similar single-state-machine interactions.

## Server (Go)
- Package: `internal/app/game/protocol/hh_room/`
- Inbound commands to implement (currently stubs):
  - 89 `USEITEM` — read `id int, state int`; look up furniture in `Room.FloorItems` by ID; call `item.AdvanceState(state)` on the item's state machine; persist new `extra_data` to DB; broadcast STUFFDATAUPDATE (88) with `id` and new extra_data to all room visitors
  - 74 `SETSTUFFDATA` — read `id int, data string`; used for admin/moderator data changes; validate rights; update item extra_data; broadcast ACTIVEOBJECT_UPDATE (95)
  - 84 `SETITEMDATA` — wall item state change; read `id int, data string`; update WallItem extra_data; broadcast UPDATEITEM (85)
  - 75 `MOVE` (sitting): when MOVE target tile is occupied by a `can_sit=TRUE` furni, instead of walking onto it, trigger sit action — update Habbo status with `sit:Z` where Z is the seat height; broadcast STATUS
  - 76 `THROW_DICE` / 77 `DICE_OFF` — dice furniture interaction: THROW_DICE advances to a random 1-6 state; broadcasts DICE_VALUE (90) with `id value`; DICE_OFF resets to 0
- Outbound commands (already registered): STUFFDATAUPDATE (88), ACTIVEOBJECT_UPDATE (95), UPDATEITEM (85), DICE_VALUE (90), STATUS (34)
- DB changes needed: no new tables; updates go to `room_furniture.extra_data` column added in TICKET-007
- Virtual state changes:
  - `pkg/virtual/furni.go` (new file): define `FurniStateMachine` interface with `AdvanceState(input int) string` method; implement `ToggleFurni` (on/off), `MultiStateFurni` (N states cycling), `DiceFurni` (random 1-6), `SeatFurni` (sit/stand)
  - `pkg/virtual/room.go`: `FurniItem` gains `StateMachine FurniStateMachine` field; assign correct machine type based on `furniture_definitions` class on room load

## Client (Godot)
- Scene/script: `client/hh_furni_classes/`, `client/hh_room/room.gd`
- What to implement:
  - Double-click or single-click (depending on furni type) on a placed furni node sends USEITEM with `id` and `state=0` (default advance)
  - `furni_base.gd`: add `on_use()` virtual method that sends the appropriate packet
  - `active_object.gd`: on STUFFDATAUPDATE (88) or ACTIVEOBJECT_UPDATE (95) for this item's ID, call `apply_extra_data(data)` to update visual state
  - Sitting: when STATUS update contains `sit:Z` for a user, play sit animation and adjust avatar Z offset
  - Specific furni implementations in `hh_furni_classes/`:
    - `furni_toggle.gd` — toggles sprite frame between state 0 and 1
    - `furni_seat.gd` — tracks `can_sit` and adjusts user avatar anchor point
    - `furni_dice.gd` — plays roll animation then shows face value; sends DICE_OFF on click when not rolling
  - On DICE_VALUE inbound (90): find furni by ID, call `show_value(v)`
  - Reference: `casts/hh_furni_classes/55_E-Dice Class.ls`, `casts/hh_furni_classes/6_Active Object Extension Class.ls`

## Acceptance criteria
- [ ] Double-clicking a toggle furni (lamp, gate) sends USEITEM; furni switches state for all room visitors
- [ ] State change is persisted to DB; state survives room reload
- [ ] Sitting: walking to a seat tile triggers sit posture on the avatar; STATUS shows `sit:Z`
- [ ] Other users see the sitting posture via STATUS broadcast
- [ ] Dice roll: clicking a dice furni sends THROW_DICE; DICE_VALUE response shows a random 1-6 face for all visitors
- [ ] DICE_OFF resets dice to face-0 state
- [ ] SETSTUFFDATA is accepted only from sessions with room moderator rights
- [ ] Wall item state change via SETITEMDATA is broadcast as UPDATEITEM to all visitors
- [ ] Unknown furni type falls back to a no-op state machine (no crash)

## Notes
- The `state` parameter in USEITEM is usually 0 (advance to next state) but can be a specific state index for multi-state furni.
- Teleport furni (class `teleport`) requires coordination between two teleport items — defer to POST-MVP.
- Roller/conveyor furni uses SLIDEOBJECTBUNDLE (230) — defer to POST-MVP.
- Dance furni (club TV, etc.) requires detecting the user is standing on the furni tile and in a dance-capable room — defer to POST-MVP.
