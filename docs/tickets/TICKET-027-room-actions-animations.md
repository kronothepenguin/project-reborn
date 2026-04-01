# TICKET-027: Room Actions - Animations & Expressions

**Priority:** MVP-2
**Size:** S
**Affects:** Server / Client
**Depends on:** TICKET-003

## Summary
Implement Habbo avatar action commands: dance (DANCE, 93), wave (WAVE, 94), stop (STOP, 88), look-to (LOOKTO, 79), carry drink (CARRYDRINK, 80), and go-away (GOAWAY, 115). These are outbound client commands that the server validates and broadcasts as STATUS (34) updates to all users in the room with the appropriate action suffix. Animations are purely cosmetic; they share the STATUS broadcast system from TICKET-003.

## Server (Go)
- Package: `internal/app/game/protocol/hh_room/`
- Inbound commands to implement:
  - 93 `DANCE` — read `dance_type int` (1–4 dance styles); set habbo action to `"dance=1"` (or appropriate dance ID); broadcast STATUS (34) to room with action
  - 94 `WAVE` — set temporary wave action; broadcast STATUS; action clears after ~2 seconds (use a goroutine timer)
  - 88 `STOP` — clear current action/dance; broadcast STATUS with no action suffix
  - 79 `LOOKTO` — read `x int, y int`; compute the facing direction; broadcast STATUS with updated direction/head rotation
  - 80 `CARRYDRINK` — read `drink_id int`; set carry-item action; broadcast STATUS with `"carryd=N"` where N is drink ID
  - 115 `GOAWAY` — remove the user from the room same as QUIT (53); broadcasts LOGOUT (29)
- Outbound commands: all STATUS (34), LOGOUT (29) are already registered from TICKET-003
- Virtual state changes:
  - `pkg/virtual/habbo.go`: add `Action string` field; add `SetAction(action string)` that updates and triggers room broadcast
  - `pkg/virtual/room.go`: `BroadcastStatus(habbo *Habbo)` should include the current `habbo.Action` in the STATUS payload

## Client (Godot)
- Scene/script: `client/hh_room/room.gd`, `client/hh_room_ui/`
- What to implement:
  - Dance button: opens a mini-picker with 4 dance styles; on select, sends DANCE (93) with the style ID
  - Wave button: sends WAVE (94) once; plays wave animation for ~2s then returns to idle
  - Stop button: sends STOP (88); cancels dance/wave
  - Look-to: on clicking a tile without moving, send LOOKTO (79) to face that direction
  - Carry drink: sends CARRYDRINK (80) with the selected drink ID; avatar holds the item visually
  - On STATUS (34) with dance action: play the correct dance animation for the avatar
  - On STATUS (34) with wave action: play one-shot wave animation
  - Reference: `casts/hh_room/5_Room Handler Class.ls` (DANCE/WAVE/STOP command handling), `casts/hh_human/` (animation states)

## Acceptance criteria
- [ ] DANCE (93) sent to server; STATUS broadcast received by all users in room with dance action
- [ ] Avatar plays the corresponding dance animation
- [ ] WAVE (94) triggers a one-shot wave animation visible to all users; auto-clears after ~2s
- [ ] STOP (88) clears current dance/wave; avatar returns to idle
- [ ] LOOKTO (79) updates avatar facing direction without movement; visible to all users
- [ ] CARRYDRINK (80) shows the correct carried item on the avatar
- [ ] GOAWAY (115) removes the user from the room cleanly (same as QUIT)
- [ ] Actions are broadcast via STATUS (34); no separate packet type needed

## Notes
- Dance styles (1–4) correspond to specific animation states in `hh_human`. Verify the dance ID→animation mapping in `casts/hh_human/`.
- Wave auto-clear: implement a 2-second timer on the server that broadcasts a STATUS update clearing the wave action. Alternatively, clear it client-side after animation completes and send STOP.
- CARRYDRINK IDs correspond to specific hand-item graphics in `hh_human_item`. Verify the ID range from that cast.
