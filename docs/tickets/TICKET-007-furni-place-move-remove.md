# TICKET-007: Furniture - Place, Move, Remove

**Priority:** MVP-2
**Size:** L
**Affects:** Server / Client / DB
**Depends on:** TICKET-006, TICKET-009, TICKET-019

## Summary
Allow users with room rights to place furniture from their inventory into a room, move placed furniture, and remove furniture back to inventory. This requires an inventory system (GETSTRIP / STRIPINFO), a furniture DB table, and the PLACESTUFF / MOVESTUFF / REMOVESTUFF server handlers, plus client-side drag-and-drop placement UI. This is the primary furniture management workflow in Habbo Hotel.

## Server (Go)
- Package: `internal/app/game/protocol/hh_room/`
- Inbound commands to implement (currently stubs):
  - 65 `GETSTRIP` — read `view string` and `page int`; query `furniture_inventory` for the session user; serialize into STRIPINFO (98) packets (page of items, each: `id class count extra`)
  - 90 `PLACESTUFF` — read `objectData string` (format: `"id x y rotation"` for floor or `"id wallpos"` for wall); validate placement position is free and user owns the item; move item from inventory to `room_furniture` row; broadcast ACTIVEOBJECT_ADD (93) to room
  - 73 `MOVESTUFF` — read `id int, x int, y int, rotation int`; validate user has rights; update `room_furniture` position; broadcast ACTIVEOBJECT_UPDATE (95) to room
  - 99 `REMOVESTUFF` — read `id int`; validate ownership or room rights; remove from `room_furniture`, add back to `furniture_inventory`; broadcast ACTIVEOBJECT_REMOVE (94) to room; send REMOVESTRIPITEM (99 inbound — note ID collision) back to remover
- Outbound commands (already registered): STRIPINFO (98), STRIPINFO_2 (140), REMOVESTRIPITEM (99), STRIPUPDATED (101), ACTIVEOBJECT_ADD (93), ACTIVEOBJECT_REMOVE (94), ACTIVEOBJECT_UPDATE (95)
- DB changes needed: yes
  - New table `furniture_definitions`: `id INT PK`, `class_name TEXT`, `type TEXT` (floor/wall), `width INT`, `length INT`, `can_stack BOOL`, `can_sit BOOL`, `is_walkable BOOL`
  - New table `furniture_inventory`: `id INT PK AUTOINCREMENT`, `owner_id INT FK users_avatar`, `definition_id INT FK furniture_definitions`, `extra_data TEXT DEFAULT ''`
  - New table `room_furniture`: `id INT PK AUTOINCREMENT`, `room_id INT FK rooms`, `definition_id INT FK furniture_definitions`, `owner_id INT FK users_avatar`, `x INT`, `y INT`, `z REAL`, `rotation INT`, `extra_data TEXT`, `wall_pos TEXT` (NULL for floor items)
  - Add sqlc queries: `GetInventoryByOwner`, `GetRoomFurniture`, `InsertRoomFurniture`, `DeleteRoomFurniture`, `UpdateRoomFurniturePosition`, `MoveToInventory`
- Virtual state changes:
  - `pkg/virtual/room.go`: update `FloorItems` and `WallItems` to be loaded from DB on room init; add `AddFloorItem`, `RemoveFloorItem`, `UpdateFloorItem` methods that modify the in-memory state and persist to DB
  - `pkg/virtual/habbo.go`: add `Inventory []FurniItem` loaded from DB on login; add `AddToInventory`, `RemoveFromInventory` methods
  - `pkg/virtual/room.go`: add `IsPlacementValid(def FurniDef, x, y, rotation int) bool` using heightmap + existing furniture footprints

## Client (Godot)
- Scene/script: `client/hh_room/room.gd`, `client/hh_room_ui/`, `client/hh_furni_classes/`
- What to implement:
  - Inventory strip UI: a scrollable horizontal bar at the bottom of the room scene showing STRIPINFO items with page navigation; send GETSTRIP on room entry (view=`new`, page=0)
  - Drag-and-drop placement: clicking an inventory item enters placement mode; show ghost furni following the cursor snapped to tiles; on tile click, send PLACESTUFF; on Escape, cancel
  - Rotation: press `r` or rotate button while in placement mode to cycle through valid rotations (0, 2, 4, 6)
  - Move mode: clicking a placed furni (if player has rights) enters move mode; same ghost + confirm flow; send MOVESTUFF
  - Pick-up: right-click or button on selected furni sends REMOVESTUFF; item appears back in inventory strip
  - On ACTIVEOBJECT_ADD (93): instantiate the new furni node in the room scene
  - On ACTIVEOBJECT_REMOVE (94): remove the furni node from the scene
  - On ACTIVEOBJECT_UPDATE (95): update position/rotation of the furni node
  - On STRIPINFO (98): populate inventory strip with received items
  - Reference: `casts/hh_room/5_Room Handler Class.ls` (placement handling), `casts/hh_furni_classes/3_Active Object Class.ls`

## Acceptance criteria
- [ ] GETSTRIP is sent on room entry; inventory items appear in the strip bar
- [ ] Dragging a floor item from inventory and clicking a valid tile sends PLACESTUFF; item appears in room for all visitors
- [ ] Attempting to place on an occupied or wall tile is rejected server-side; client shows no placement confirmation
- [ ] Rotating furni during placement cycles through valid rotations; final rotation is persisted
- [ ] Moving a placed item updates its position for all visitors in real time
- [ ] Removing an item returns it to inventory and removes it from the room for all visitors
- [ ] Inventory and room furniture state survive server restart (persisted to DB)
- [ ] Pagination in the inventory strip works (GETSTRIP with page > 0)
- [ ] Non-owner attempting MOVESTUFF/REMOVESTUFF without room rights receives no confirmation (server ignores)

## Notes
- GETSTRIP uses a `view` parameter: `"new"` for normal inventory, `"handitem"` for carried items. For MVP, implement `"new"` only.
- Wall item placement (PLACESTUFF with wall position string) is more complex than floor placement; implement floor items first and treat wall items as a sub-task.
- STRIPINFO_2 (140) is a variant of STRIPINFO used in some contexts; register it but only implement the primary STRIPINFO for MVP.
- The `id` field in PLACESTUFF refers to the inventory item ID, not the furniture definition ID. The server must validate ownership before accepting placement.
- **Fuses permission system:** placement and movement rights depend on the fuse level:
  - Owner: can place/move/remove all furniture in their room
  - Controller (rights holder): can move/remove furniture; may or may not place (configurable per room)
  - Fuse-admin (Hobba rank): can place furniture in ANY room regardless of ownership
  - Check `room.IsOwner(habboID)`, `room.HasRights(habboID)`, or `habbo.Rank >= HobbaRank` before accepting PLACESTUFF/MOVESTUFF/REMOVESTUFF
- Users must own a private room before placing furniture. Room creation is handled in TICKET-019.
