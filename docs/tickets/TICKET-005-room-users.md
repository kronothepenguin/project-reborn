# TICKET-005: Room User List

**Priority:** MVP-1
**Size:** M
**Affects:** Client (primary) / Server (minor)
**Depends on:** TICKET-002

## Summary
Render all users currently in a room and keep their presence in sync. This covers parsing the USERS (28) packet on room entry to spawn avatars for each visitor, handling the LOGOUT (29) packet to despawn users who leave, and applying STATUS (34) updates to update positions and actions for all users after the initial join. This ticket is client-heavy because the server's G_USRS handler already emits a USERS packet; the gap is correct client-side parsing and multi-user avatar management.

## Server (Go)
- Package: `internal/app/game/protocol/hh_room/`
- Inbound commands to implement:
  - 61 `G_USRS` — currently returns a single hardcoded user string; replace with iteration over `Room.Visitors` map and serialize each `*Habbo` using a proper USERS serializer function
  - 53 `QUIT` — currently a stub; on receipt, remove the session's Habbo from `Room.Visitors`, broadcast LOGOUT (29) with the user's room ID to all remaining visitors, clean up `Habbo.CurrentRoomID`
- Outbound commands: USERS (28), LOGOUT (29), STATUS (34)
- DB changes needed: no
- Virtual state changes:
  - `pkg/virtual/room.go`: add `AddVisitor(h *Habbo)`, `RemoveVisitor(id int)`, `BroadcastToAll(cmd string, args ...io.WriterTo)` methods
  - `pkg/virtual/room.go`: add `SerializeUser(h *Habbo) string` to produce the tab/newline-delimited user string matching the existing hardcoded format: `i:`, `n:`, `f:`, `l:`, `c:`, `s:`, `b:`, `a:`, `x:`
  - On session disconnect (-1 listener): call the same leave-room cleanup as QUIT

## Client (Godot)
- Scene/script: `client/hh_room/room.gd`, `client/hh_human/human.gd`, `client/hh_human/human.tscn`
- `hh_human/` is partially functional (figure rendering exists).
- What to implement:
  - `room.gd`: on USERS inbound (28), parse the `\r`-delimited block into a list of user-data maps (keys: `i`, `n`, `f`, `l`, `c`, `s`, `b`, `a`); for each entry, instantiate `human.tscn`, configure figure from `f:` value, position at tile coordinates from `l:` value (`x y z`), add to `users` dictionary keyed by room ID
  - `room.gd`: on LOGOUT inbound (29), read user room-ID, look up in `users` dict, call `queue_free()`, remove from dict
  - `room.gd`: on STATUS inbound (34), parse each user's status block; update position, rotation, and action for that user's HumanNode (delegate to `human.gd` `apply_status(data)` method)
  - `human.gd`: add `configure(figure: String, sex: String, name: String)` method that calls into the existing figure_system; add `apply_status(status: Dictionary)` for position/action updates
  - Name label above avatar: small `Label3D` or `Label` in screen space showing `n:` value
  - Figure rendering uses the existing `figure_system.gd` and part cast resources under `hh_human_*/`
  - Reference: `casts/hh_room/5_Room Handler Class.ls` (USERS/LOGOUT/STATUS handling)

## Acceptance criteria
- [ ] On room entry, all present users are rendered as avatars at their correct tile positions
- [ ] Each avatar has the correct figure string applied (clothing visible)
- [ ] Each avatar has a name label showing their username
- [ ] When a second client joins the room, the first client sees a new avatar appear without reloading
- [ ] When a user leaves (QUIT), their avatar is removed from the room scene in all other clients
- [ ] STATUS updates from TICKET-003 correctly move other users' avatars (not just the local player)
- [ ] Up to 25 users in a single room are all rendered without error
- [ ] USERS packet with zero visitors (empty room) is handled without error

## Notes
- The USERS packet uses a raw string format, not the standard int/string protocol encoding. Use `ReadRawString` on the server and parse the `\r`-delimited key-value format on both sides.
- `b:` in the USERS packet is `count:badge1,badge2,...` format (note the colon-separated sub-format inside the line).
- `l:` is `x y z` space-separated; `z` may be a float string.
- The local player's own entry will be included in the USERS response — the client should detect this by matching its own name/ID and skip re-instantiating (or overlay the local-control avatar instead).
