# TICKET-032: Room Spectator Mode

**Priority:** MVP-3
**Size:** S
**Affects:** Server / Client
**Depends on:** TICKET-002

## Summary
Implement spectator mode for rooms at capacity. When a room is full (`current_visitors >= max_visitors`), new entrants are placed in a spectator queue rather than being rejected outright. The server sends YOUARESPECTATOR (254) and ROOMQUEUEDATA (259) with queue position; the client shows a "Waiting in queue" UI. When a slot opens, the first spectator in the queue is promoted to a full room visitor.

## Server (Go)
- Package: `internal/app/game/protocol/hh_room/`
- Logic to implement (in room entry flow):
  - On TRYFLAT/GOTOFLAT: if `room.CurrentVisitors >= room.MaxVisitors`, check if spectator mode is enabled for the room; if yes, add session to `room.SpectatorQueue`; send YOUARESPECTATOR (254) to session; send ROOMQUEUEDATA (259) with position; otherwise send CANTCONNECT (224)
  - On user QUIT: if `room.SpectatorQueue` is non-empty, dequeue the first spectator; complete their room entry (send OPC_OK, heightmap, users list, items list); broadcast users/status updates to existing room users
  - Spectator updates: when a spectator's position changes (someone ahead of them leaves the queue), send updated ROOMQUEUEDATA (259) to all remaining spectators
  - 298 `SPECTATOR_AMOUNT` (outbound) — broadcast to room when spectator count changes: `spectator_count int`
- Outbound commands to register:
  - 254 `YOUARESPECTATOR` — no payload; tells client to enter spectator UI mode
  - 259 `ROOMQUEUEDATA` — `position int`, `total_in_queue int`
  - 298 `SPECTATOR_AMOUNT` — `count int`; sent to all room users showing how many are waiting
- Virtual state changes:
  - `pkg/virtual/room.go`: add `SpectatorQueue []*Habbo` (ordered slice); add `AddSpectator(h *Habbo)`, `RemoveSpectator(h *Habbo)`, `PromoteNextSpectator()` methods
  - `pkg/virtual/room.go`: update `CurrentVisitors int` to be derived from `len(Visitors)`, not a separate counter

## Client (Godot)
- Scene/script: `client/hh_room/room.gd`
- Reference: `casts/hh_room/5_Room Handler Class.ls` — handle_youarespectator, handle_roomqueuedata
- What to implement:
  - On YOUARESPECTATOR (254): switch to spectator UI mode — show the room view (read-only), disable movement/chat interaction, show queue panel
  - Queue panel: shows "You are in queue — position X of Y"; updates on new ROOMQUEUEDATA (259)
  - On promotion (server sends OPC_OK after YOUARESPECTATOR state): dismiss queue panel; re-enable all room interaction
  - SPECTATOR_AMOUNT (298): show spectator count badge on the room view for all current visitors

## Acceptance criteria
- [ ] Full room (at max capacity): new GOTOFLAT sends YOUARESPECTATOR, then ROOMQUEUEDATA with position
- [ ] Client shows queue panel with correct position
- [ ] Existing user leaving the room triggers promotion of first spectator; they receive OPC_OK and enter normally
- [ ] Queue positions update for remaining spectators after a promotion
- [ ] SPECTATOR_AMOUNT broadcast updates the badge for all current room visitors
- [ ] Spectator cannot move, chat, or interact while in queue
- [ ] CANTCONNECT is sent when room is full AND spectator mode is disabled for that room

## Notes
- Spectator mode enabled per room: add `spectator_mode BOOL DEFAULT TRUE` column to the `rooms` table; public rooms should have it enabled.
- SpectatorQueue is in-memory only (not persisted). If the server restarts, spectators are cleared; they would need to re-enter via GOTOFLAT.
- ROOMQUEUEDATA position is 1-based (position 1 = next to enter).
