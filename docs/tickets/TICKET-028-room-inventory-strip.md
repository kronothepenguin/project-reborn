# TICKET-028: Room Inventory Strip

**Priority:** MVP-2
**Size:** M
**Affects:** Server / Client / DB
**Depends on:** TICKET-007

## Summary
Implement the in-room inventory strip (hand item bar). When the player enters a room, the client sends GETSTRIP (65) to request paginated inventory data; the server responds with STRIPINFO (98) containing items from the `furniture_inventory` table. The strip is a prerequisite for furniture placement (TICKET-007) and item trading (TICKET-017). This ticket focuses on the data layer and strip UI; drag-and-drop placement is covered in TICKET-007.

## Server (Go)
- Package: `internal/app/game/protocol/hh_room/`
- Inbound commands to implement:
  - 65 `GETSTRIP` — read `view string` (e.g. `"new"` or `"handitem"`), `page int`; query `furniture_inventory` for `owner_id = session.Habbo.ID`, offset by page × PAGE_SIZE; serialize each item into STRIPINFO format; send STRIPINFO (98)
  - 67 `ADDSTRIPITEM` (alias: `MOVETOSTRIPITEM`) — used when a floor item is picked up from the room back to strip; add item back to `furniture_inventory`; send STRIPINFO update for the affected slot
- Outbound commands (register if not already):
  - 98 `STRIPINFO` — paginated inventory: `page int`, `total_pages int`, `num_items int`, then per item: `id int`, `class_name string`, `count int`, `extra_data string`
  - 140 `STRIPINFO_2` — variant; register same as 98 for now
  - 99 `REMOVESTRIPITEM` — `item_id int`; sent when item is placed into the room
  - 101 `STRIPUPDATED` — broadcast to trigger client to re-fetch strip
- DB: uses `furniture_inventory` and `furniture_definitions` tables from TICKET-007. No new tables.
- Add sqlc query: `GetInventoryPage(ownerID, offset, limit int)`, `CountInventoryItems(ownerID int)`

## Client (Godot)
- Scene/script: `client/hh_room_ui/strip.gd`, `client/hh_room_ui/strip.tscn`
- Reference: `casts/hh_room/` — Room Interface Class.ls handles strip UI
- What to implement:
  - `strip.tscn` — horizontal scrollable bar at the bottom of the room scene; each slot shows the item graphic and count badge; left/right arrows for pagination
  - On room entry: send GETSTRIP (65) with `view="new"`, `page=0`
  - On STRIPINFO (98): populate strip slots; show page number if total_pages > 1
  - Pagination: left/right arrow buttons send GETSTRIP with the appropriate page number
  - On REMOVESTRIPITEM (99): remove the specific item slot from the strip
  - On STRIPUPDATED (101): re-send GETSTRIP (65) to refresh the strip
  - On ADDSTRIPITEM (server-inbound): slot reappears in strip (server re-sends STRIPINFO for affected page)
  - Reference: `casts/hh_room/3_Room Interface Class.ls` for strip layout, `casts/hh_furni_classes/` for item graphics

## Acceptance criteria
- [ ] GETSTRIP is sent on room entry; STRIPINFO response populates the strip bar
- [ ] Items in `furniture_inventory` for the logged-in user appear in the strip
- [ ] Pagination: if more items than PAGE_SIZE (e.g. 9), left/right arrows navigate pages
- [ ] REMOVESTRIPITEM removes the item from the strip when placed in room
- [ ] Picking up a room item (ADDSTRIPITEM) adds it back to the strip
- [ ] Strip state is accurate after server restart (loaded from DB)
- [ ] Strip shows item count badge when count > 1 (stackable items)

## Notes
- PAGE_SIZE is 9 items per page (3×3 grid in the original client). Keep this convention.
- `view="handitem"` is for carried items (CARRYDRINK from TICKET-027); for MVP, only implement `view="new"`.
- STRIPINFO_2 (140) appears to be used in some contexts; register it but map to the same handler as STRIPINFO for now.
- The strip is visible only inside a room, not in Hotel View.
