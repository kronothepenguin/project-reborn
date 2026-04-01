# TICKET-002: Room Entry

**Priority:** MVP-1
**Size:** M
**Affects:** Server / Client / DB
**Depends on:** TICKET-001

## Summary
Implement the full room entry handshake so that selecting a public room in the Navigator causes the client to connect to that room and receive the initial room state. The sequence is: GOTOFLAT (59) or room_directory (2) -> OPC_OK (19) -> ROOM_READY (69) -> client sends G_HMAP (60) / G_USRS (61) / G_OBJS (62) / G_ITEMS (63) / G_STAT (64) -> server responds with HEIGHTMAP (31) / USERS (28) / OBJECTS (30) + ACTIVEOBJECTS (32) / ITEMS (45) / STATUS (34). Without this ticket no room content is visible.

## Server (Go)
- Package: `internal/app/game/protocol/hh_room/`
- Handler skeletons already exist in `room.go`; all handlers currently log and return nil (no logic).
- Inbound commands to implement (currently stubbed):
  - 2 `room_directory` — partial implementation exists: sends OPC_OK and ROOM_READY; needs to look up actual room by ID from `Hotel.Rooms`, associate session with room, guard against full/locked rooms
  - 57 `TRYFLAT` — validate door state and password for private rooms; send FLATPASSWORD_OK (130 via navigator) or FLATNOTALLOWEDTOENTER (131)
  - 59 `GOTOFLAT` — parse flat ID, resolve room, trigger room_directory flow
  - 60 `G_HMAP` — serve heightmap string from `virtual.Room.Model`; currently returns hardcoded ballroom heightmap string, needs to look up room by session's current room ID
  - 61 `G_USRS` — serialize all `Room.Visitors` into USERS packet; currently returns single hardcoded user stub
  - 62 `G_OBJS` — serialize floor furniture from `Room.FloorItems`; currently returns empty OBJECTS + ACTIVEOBJECTS(0)
  - 63 `G_ITEMS` — serialize wall items from `Room.WallItems`; currently returns nil
  - 64 `G_STAT` — serialize movement/action STATUS for all users; currently returns nil
- Outbound commands (already registered): OPC_OK (19), ROOM_READY (69), HEIGHTMAP (31), USERS (28), OBJECTS (30), ACTIVEOBJECTS (32), ITEMS (45), STATUS (34), FLATNOTALLOWEDTOENTER (131), CANTCONNECT (224)
- DB changes needed: yes
  - Add `model TEXT NOT NULL DEFAULT 'ballroom'` to Room table if not added by TICKET-001
  - Add `sqlc` query `GetRoomByID`
- Virtual state changes:
  - `pkg/virtual/room.go`: add `Room` struct — fields: `ID int`, `Name string`, `Model string`, `IsPublic bool`, `DoorState string`, `Password string`, `OwnerID int`, `OwnerName string`, `MaxVisitors int`, `Mu sync.RWMutex`, `Visitors map[int]*Habbo`, `FloorItems []FurniItem`, `WallItems []WallItem`
  - `pkg/virtual/hotel.go`: add `Rooms map[int]*Room`; add `loadRooms(storage)` on boot
  - `pkg/virtual/habbo.go`: add `CurrentRoomID int` field
  - `pkg/virtual/connection.go`: add `JoinRoom(*Room)` and `LeaveRoom()` helpers

## Client (Godot)
- Scene/script: `client/hh_room/room.gd`, `client/hh_room/room.tscn`
- `room.tscn` and `room.gd` exist but are stubs; `hh_room.gd` also exists (likely the cast entry point).
- What to implement:
  - `hh_room.gd` — register message_bus listeners for OPC_OK (19), ROOM_READY (69), HEIGHTMAP (31), USERS (28), OBJECTS (30), ACTIVEOBJECTS (32), ITEMS (45), STATUS (34)
  - On ROOM_READY: transition scene to room, send G_HMAP, G_USRS, G_OBJS, G_ITEMS, G_STAT in sequence
  - `room.gd` — scene root; instantiate and position room geometry from HEIGHTMAP payload; spawn user nodes from USERS payload
  - Tile grid parsing: HEIGHTMAP is a `\r`-delimited string; each character maps to tile height (0-9, A=10, B=11, … or 'x' = wall/void)
  - Reference: `casts/hh_room/5_Room Handler Class.ls`, `casts/hh_room/4_Room Component Class.ls`, `casts/hh_room/7_Room Geometry Class.ls`

## Acceptance criteria
- [ ] Clicking a public room in the Navigator sends GOTOFLAT or room_directory to the server
- [ ] Server responds with OPC_OK then ROOM_READY containing the room model name
- [ ] Client sends G_HMAP immediately after ROOM_READY; server returns HEIGHTMAP with correct tile data for that room model
- [ ] Heightmap is parsed and tile grid is rendered in the room scene (floor tiles visible)
- [ ] Client sends G_USRS; server returns USERS packet with at least the entering player's data
- [ ] Client sends G_OBJS; server returns OBJECTS and ACTIVEOBJECTS (empty is acceptable for MVP)
- [ ] Client sends G_ITEMS; server returns ITEMS (empty acceptable for MVP)
- [ ] Client sends G_STAT; server returns STATUS (empty acceptable for MVP)
- [ ] The entering player's avatar is visible in the room at the spawn position
- [ ] Attempting to enter a room that is full sends CANTCONNECT; client shows appropriate error

## Notes
- The ROOM_READY payload is just the room model/marker string (e.g. `"ballroom"`); the client uses this to determine which room cast assets to load.
- Session-to-room association must be cleaned up on disconnect (handle the -1 DISCONNECT listener already registered).
- For MVP, room models can be loaded from flat files under `casts/hh_room/` — defer DB-stored heightmaps to a later ticket.
- TRYFLAT/password flow is covered in more detail in TICKET-011; stub it here to return OK for public rooms.
