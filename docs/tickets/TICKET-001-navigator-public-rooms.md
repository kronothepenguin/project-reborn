# TICKET-001: Navigator - Public Rooms

**Priority:** MVP-1
**Size:** M
**Affects:** Server / Client / DB
**Depends on:** none (login/hh_entry_init already done)

## Summary
Implement the Navigator's public room browsing flow so that a logged-in Habbo can open the Navigator window, request the public room tree via NAVIGATE (outbound 150), and receive a NAVNODEINFO response (inbound 220) containing the current public room list with visitor counts and metadata. This is the first user-facing feature after login and gates all room-entry work.

## Server (Go)
- Package: `internal/app/game/protocol/hh_navigator/`
- The handler skeleton and command/listener registration already exist in `navigator.go`. The `handleNavigate` function reads nodeId/nodeMask/depth and returns NAVNODEINFO, but relies entirely on `packet.Session.Hotel.Navigator.Nodes` which is currently populated from hardcoded/config data only.
- Inbound commands to handle (already registered, logic incomplete):
  - 150 `NAVIGATE` — resolve nodeId from virtual Navigator, serialize `NavigatorNode` tree to NAVNODEINFO
  - 264 `GET_RECOMMENDED_ROOMS` — already implemented, returns RECOMMENDED_ROOM_LIST (351)
- Outbound commands already registered: NAVNODEINFO (220), RECOMMENDED_ROOM_LIST (351), NOFLATS (58)
- DB changes needed: yes
  - Extend `Room` table: add `description TEXT`, `owner_name TEXT`, `max_visitors INT DEFAULT 25`, `current_visitors INT DEFAULT 0`, `door_state TEXT DEFAULT 'open'`, `category_id INT`, `is_public BOOL DEFAULT FALSE`, `model TEXT` (heightmap model name), `floor_level INT DEFAULT 0`
  - Regenerate sqlc models after schema change
- Virtual state changes:
  - `pkg/virtual/room.go` is currently empty (package declaration only). Add `Room` struct with fields mirroring the DB extension plus in-memory `Visitors []*Habbo` slice and `Mu sync.RWMutex`.
  - `pkg/virtual/navigator.go` `NavigatorFlat` already has Name/Owner/Door/UserCount/MaxUsers/Description — verify these are populated from DB on hotel boot.
  - Add `Hotel.loadPublicRooms(storage)` call in `hotel.go` init sequence to seed Navigator nodes from DB rows where `is_public = TRUE`.

## Client (Godot)
- Scene/script: `client/hh_navigator/`
- Currently empty — no `.gd` or `.tscn` files exist.
- What to implement:
  - `hh_navigator.gd` — cast entry point; registers with `message_bus` for NAVNODEINFO (220) and RECOMMENDED_ROOM_LIST (351) inbound messages
  - `navigator_window.tscn` — main Navigator window UI (replicate layout from `casts/hh_navigator/3_Navigator Window Interface Class.ls`)
  - `navigator_roomlist.gd` — populates room list rows from NAVNODEINFO payload; each row shows room name, owner, visitor count
  - `navigator_component.gd` — sends NAVIGATE (150) on tab/category selection; sends GET_RECOMMENDED_ROOMS (264) on open
  - Reference: `casts/hh_navigator/6_Navigator Handler Class.ls`, `casts/hh_navigator/4_Navigator Roomlist Interface Class.ls`

## Acceptance criteria
- [ ] Navigator window opens after login without error
- [ ] NAVIGATE packet with nodeId=3 (public rooms root) is sent to server on open
- [ ] NAVNODEINFO response is received and parsed; public room list rows are rendered
- [ ] Each row displays room name, visitor count, and max visitors
- [ ] Rooms stored in DB with `is_public = TRUE` appear in the list
- [ ] Navigator node tree is loaded from DB on server startup, not hardcoded
- [ ] RECOMMENDED_ROOM_LIST is requested and displayed in a separate tab/section
- [ ] NOFLATS (58) response renders an empty-state message, not an error

## Notes
- The virtual `Navigator` struct in `pkg/virtual/navigator.go` already has `Nodes map[int]*NavigatorInfo`, `RootFlatCatId int`, `Recommended()`, and `Filter()`. The missing piece is DB-backed seeding.
- Public room nodes use `NavigatorUnitNode` (has `UnitStrID`, `Port`, `Door`, `Casts`). Private room categories use `NavigatorFlatCategoryNode`. Keep these distinct.
- `serializeNavigatorNode` in `navigator.go` handles both node types already; verify the flat-category branch populates from DB rooms.
- sqlc query file will need new queries: `GetPublicRooms`, `GetRoomsByCategory`.
