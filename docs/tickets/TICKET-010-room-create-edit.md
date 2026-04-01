# TICKET-010: Room Management - Create, Edit, Delete

**Priority:** MVP-2
**Size:** S
**Affects:** Server / Client / DB
**Depends on:** TICKET-001

## Summary
Allow users to create new private rooms, edit their properties (name, description, door state, max visitors), and delete them. The Navigator already has UPDATEFLAT/SETFLATINFO/DELETEFLAT handlers registered and sending SUCCESS stubs. This ticket wires them to real DB operations and adds a "Create Room" flow in the client.

## Server (Go)
- Package: `internal/app/game/protocol/hh_navigator/`
- The handlers exist in `navigator.go`. This ticket implements the DB persistence layer for each.
- Inbound commands to implement (stubs currently return SUCCESS with no side effects):
  - 24 `UPDATEFLAT` — already parses `flatID/name/door/showOwnerName`; persist to DB: `UPDATE rooms SET name=?, door_state=?, show_owner_name=? WHERE id=? AND owner_id=?`; update the `NavigatorFlat` in virtual navigator; broadcast FLATINFO update if other users have the room info panel open
  - 25 `SETFLATINFO` — parses additional flat properties (description, max_visitors, trading allowed, category); persist all changed fields to DB; update virtual navigator flat
  - 23 `DELETEFLAT` — validate caller is owner; delete `room_furniture` rows for the room, then delete the `rooms` row; remove the flat from navigator nodes and from `habbo.Flats`; send SUCCESS(23)
  - New handler for room creation: no existing outbound command for "create room confirm" in the lingo protocol — creation is typically done via CMS/web and reflected in SUSERF. For this implementation, add a thin internal RPC or extend SETFLATINFO with `flatID=0` as the creation signal; assign new room ID and respond with SUCCESS containing the new ID.
- Outbound commands: SUCCESS (225), FAILURE (226), FLATINFO (54)
- DB changes needed: yes
  - Add `show_owner_name BOOL DEFAULT TRUE`, `trading_allowed BOOL DEFAULT TRUE` columns to `rooms` table (if not added in TICKET-001)
  - Add sqlc queries: `CreateRoom`, `UpdateRoomProperties`, `DeleteRoom` (if not added in TICKET-009)
- Virtual state changes:
  - `pkg/virtual/navigator.go`: add `CreateFlat(ownerID int, name string) *NavigatorFlat` that inserts to DB and adds to navigator nodes
  - `pkg/virtual/navigator.go`: add `DeleteFlat(flatID int)` that removes from nodes map and DB

## Client (Godot)
- Scene/script: `client/hh_navigator/`
- Builds on TICKET-001 and TICKET-009 Navigator UI.
- What to implement:
  - "Create Room" button in Navigator "My Rooms" tab
  - Create room dialog: fields for room name (required), description, max visitors (slider 10-50), door state (open/locked/password), trading allowed (checkbox)
  - On confirm: send SETFLATINFO with flatID=0 (creation signal); on SUCCESS, refresh My Rooms list
  - Edit room dialog: same form, pre-populated with current values; triggered from right-click or edit button on own room row; sends UPDATEFLAT for name/door changes and SETFLATINFO for description/settings
  - Delete confirmation dialog: "Are you sure?" modal; on confirm, send DELETEFLAT; remove room from list on SUCCESS
  - Failure response (FAILURE, 226): show error alert using `hh_interface/habbo_alert_*` components
  - Reference: `casts/hh_navigator/73_nav_gr_modify_delete1.window.txt`, `casts/hh_navigator/74_nav_gr_modify_delete2.window.txt`, `casts/hh_navigator/65_nav_gr0.window.txt`

## Acceptance criteria
- [ ] Create Room dialog opens and sends SETFLATINFO (or equivalent) with valid data
- [ ] New room is created in DB and appears in "My Rooms" list immediately after creation
- [ ] Edit dialog pre-populates with current room values; saving sends UPDATEFLAT/SETFLATINFO and persists changes
- [ ] Room name is required; submitting an empty name is blocked client-side and rejected server-side
- [ ] Door state change (open/locked) is persisted and reflected in Navigator room list
- [ ] Delete confirmation dialog is shown before sending DELETEFLAT
- [ ] After deletion, room no longer appears in any Navigator tab or search results
- [ ] Non-owner cannot edit or delete another user's room (server ignores, client does not offer UI)
- [ ] User can own at most N rooms as defined by hotel settings (server enforces limit)

## Notes
- Max rooms per user limit should be driven by `Hotel.Settings` (add a `MaxRoomsPerUser int` field).
- Room creation via the Habbo client in R26 was done through a separate create-flat dialog. The exact packet sequence for creation differs between client versions; match the flow used by the existing `hh_navigator` cast reference.
- If the web/CMS creates rooms out-of-band, the hotel needs a mechanism to refresh the navigator node tree — a `ReloadRooms()` method on the Navigator virtual struct is sufficient for MVP.
