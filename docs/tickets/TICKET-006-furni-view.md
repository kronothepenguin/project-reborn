# TICKET-006: Furniture - View Only

**Priority:** MVP-1
**Size:** S
**Affects:** Client (primary) / Server (minor)
**Depends on:** TICKET-002

## Summary
Parse and render floor furniture (active objects) and wall items on room entry so that rooms with furniture look correct. This covers the ACTIVEOBJECTS (32) and OBJECTS (30) packets for floor furni and the ITEMS (45) packet for wall items. No interaction or inventory management is included — that is TICKET-007 and TICKET-008. This ticket makes rooms visually complete for the MVP demo.

## Server (Go)
- Package: `internal/app/game/protocol/hh_room/`
- Inbound commands to implement:
  - 62 `G_OBJS` — currently sends empty OBJECTS + ACTIVEOBJECTS(0); replace with serialization of `Room.FloorItems` once the virtual Room struct has them (added in TICKET-002). For MVP, rooms can have furniture seeded from a fixture/config file rather than DB.
  - 63 `G_ITEMS` — currently returns nil; serialize `Room.WallItems` into ITEMS packet
- Outbound commands (already registered): OBJECTS (30), ACTIVEOBJECTS (32), ITEMS (45)
- DB changes needed: no for view-only; furniture table will be added in TICKET-007
- Virtual state changes:
  - `pkg/virtual/room.go`: add `FloorItems []FurniItem` and `WallItems []WallItem`
  - New types in `pkg/virtual/`: `FurniItem{ID int, Class string, X, Y int, Z float32, Rotation int, ExtraData string}`, `WallItem{ID int, Class string, WallPos string, ExtraData string}`
  - Seed test furniture on room init from a hardcoded fixture so the client has something to render

## Client (Godot)
- Scene/script: `client/hh_room/room.gd`, `client/hh_furni_classes/`
- `client/hh_furni_classes/` is empty — this will be the home for furniture scene/script files.
- What to implement:
  - `room.gd`: on ACTIVEOBJECTS inbound (32), parse count then each active object record: `id class x y z rotation extradata`; instantiate the corresponding furni scene; position on tile grid
  - `room.gd`: on OBJECTS inbound (30), parse the raw OBJECTS string (older format used for some room types); merge with ACTIVEOBJECTS rendering
  - `room.gd`: on ITEMS inbound (45), parse wall item records: `id class wallpos extradata`; instantiate wall furni scenes; position on wall using wall coordinate string
  - `client/hh_furni_classes/furni_base.gd` — base script for all furniture: holds ID, class name, extra_data; provides `apply_extra_data(data: String)` virtual method
  - `client/hh_furni_classes/active_object.gd` — floor furniture base; isometric tile placement
  - `client/hh_furni_classes/item_object.gd` — wall item base; wall coordinate parser
  - Furniture sprites: sourced from `client/external/` or `hh_furni_classes/` resource packs; fall back to a colored placeholder box if the asset is not found
  - ACTIVEOBJECT_ADD (93), ACTIVEOBJECT_REMOVE (94), ACTIVEOBJECT_UPDATE (95) — register listeners and stub them; full logic is TICKET-007
  - Reference: `casts/hh_furni_classes/3_Active Object Class.ls`, `casts/hh_furni_classes/4_Passive Object Class.ls`, `casts/hh_furni_classes/5_Item Object Class.ls`

## Acceptance criteria
- [ ] Room entry triggers G_OBJS and G_ITEMS requests; server responds with furniture data
- [ ] Floor furniture items are rendered at the correct tile positions and rotations
- [ ] Wall items are rendered at correct wall positions
- [ ] Empty furniture lists (count=0) are handled without error or log spam
- [ ] Furniture with an unknown class name falls back to a placeholder mesh, not an error
- [ ] ACTIVEOBJECTS count is parsed correctly (not confused with OBJECTS raw string)
- [ ] At least one seeded furniture item is visible in a test room after entry
- [ ] ACTIVEOBJECT_ADD/REMOVE/UPDATE listeners are registered (stubs acceptable for this ticket)

## Notes
- OBJECTS (30) is the legacy raw-format packet used primarily in public rooms; ACTIVEOBJECTS (32) uses a more structured count-then-records format. Both must be handled.
- Wall item position uses a string format like `":w=3,2 l=4,3,4"` which encodes wall ID and offset. A wall position parser utility is needed.
- `ExtraData` is a string used for furniture state (e.g., color index, on/off). For view-only, just store it — apply it in TICKET-008.
- The `hh_furni_classes` cast reference list (55+ files) is extensive. For MVP, implement the base classes only; specific furniture type classes (dice, teleport, etc.) are TICKET-008.
