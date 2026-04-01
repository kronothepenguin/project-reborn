# TICKET-003: Room Movement

**Priority:** MVP-1
**Size:** L
**Affects:** Server / Client
**Depends on:** TICKET-002

## Summary
Implement avatar walking so that clicking a tile sends MOVE (outbound 75) to the server, which runs pathfinding on the room's heightmap grid, and broadcasts a STATUS (inbound 34) packet to all users in the room containing the walking path and final position. The client then animates the avatar along the path. Movement is the core interaction of any room session and is required before most other room features make sense.

## Server (Go)
- Package: `internal/app/game/protocol/hh_room/`
- Sub-package (new): `internal/pkg/pathfinding/` — isolate the pathfinding algorithm
- Inbound commands to implement:
  - 75 `MOVE` — read target `x int, y int` from packet; validate tile is walkable in the room's heightmap; run pathfinder from the user's current position; update `Habbo.X`, `Habbo.Y` (tentatively); broadcast STATUS to all room visitors
  - 88 `STOP` — cancel current movement; broadcast STATUS with current position and `mv` action cleared; `handleStop` currently reads a raw string but does not act on it
  - 64 `G_STAT` — send STATUS for all current room visitors including the entering user; currently returns nil
- Outbound commands: STATUS (34), SLIDEOBJECTBUNDLE (230) — used for roller furniture movement, not needed yet
- DB changes needed: no
- Virtual state changes:
  - `pkg/virtual/room.go`: add `HeightmapGrid [][]byte` parsed from model string on room load; add `IsWalkable(x, y int) bool` method
  - `pkg/virtual/habbo.go`: add `X int`, `Y int`, `Z float32`, `Rotation int`, `MovePath [][2]int`, `IsMoving bool`
  - `pkg/virtual/room.go`: add `BroadcastStatus(exclude *Habbo)` helper that sends STATUS to all visitors
- Pathfinding sub-task:
  - `internal/pkg/pathfinding/astar.go` — A* or BFS over the heightmap grid; nodes are `(x, y)` pairs; heuristic is Chebyshev distance (Habbo uses 8-directional movement); impassable tiles are walls (`x`) and tiles with `walkable=false` active objects
  - Input: `grid [][]byte`, `from [2]int`, `to [2]int`; output: `[][2]int` path slice (empty if unreachable)
- STATUS packet format (already in codebase as raw string in G_USRS stub): `"id:N\r" + "l:X Y Z\r" + "mv:X,Y,Z/X,Y,Z/...\r"` — implement as a proper serializer function

## Client (Godot)
- Scene/script: `client/hh_room/room.gd`, `client/hh_human/human.gd`
- What to implement:
  - `room.gd`: on tile click, calculate tile coordinates from 3D pick ray; send MOVE packet with `x, y` integers
  - `room.gd`: on STATUS inbound (34), parse the raw string into a map of `user_id -> {x, y, z, path, action}`; call `update_status(data)` on each user's HumanNode
  - `human.gd` / `human_class_ex.gd`: add `walk_path(path: Array)` method that drives the Tween/AnimationPlayer along the tile path; rotate avatar to face direction of travel; play walk cycle; on path end, play idle
  - `client/hh_room_utils/hh_room_utils.gd`: add `tile_to_world(x, y, z)` coordinate conversion helper (isometric projection)
  - Reference: `casts/hh_room/5_Room Handler Class.ls` (STATUS parsing), `casts/hh_room/7_Room Geometry Class.ls` (coordinate math)

## Acceptance criteria
- [ ] Clicking a walkable tile sends MOVE packet with correct x, y coordinates
- [ ] Server validates the tile is walkable; ignores or NAKs move to wall/void tiles
- [ ] Server runs pathfinding and finds a valid path (or empty path if unreachable)
- [ ] STATUS broadcast is sent to all room visitors with the moving user's path
- [ ] Avatar walks smoothly along the path in the client; each tile transition takes approximately 0.5 seconds
- [ ] Avatar rotates to face the direction of movement at each step
- [ ] Walk animation plays during movement; idle animation plays when stopped
- [ ] Two users in the same room see each other's movement in real time
- [ ] STOP packet cancels movement; avatar halts at current tile
- [ ] G_STAT response on room entry includes positions of all present users
- [ ] Pathfinding unit tests pass for: direct path, path around obstacle, unreachable tile (empty result)

## Notes
- STATUS format for movement uses `mv:` key with slash-separated waypoints, each `X,Y,Z`.
- Height transitions (e.g. stair tiles A-F) must be reflected in the Z value of each waypoint.
- Pathfinding must account for other users as soft obstacles (prefer paths around them but allow overlap as fallback).
- Split pathfinding into its own package so it can be unit-tested without a full server context.
- SLIDEOBJECTBUNDLE (230) is used for roller/conveyor furniture — defer to TICKET-008.
