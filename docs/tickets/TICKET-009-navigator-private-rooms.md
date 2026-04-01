# TICKET-009: Navigator - Private Rooms, Search, Categories

**Priority:** MVP-2
**Size:** M
**Affects:** Server / Client
**Depends on:** TICKET-001, TICKET-019

## Summary
Extend the Navigator to support private (user-created) rooms. This adds room search (SRCHF, outbound 17), browsing a user's own rooms (SUSERF, outbound 16), flat category management (GETUSERFLATCATS/SETFLATCAT), and the full private room listing in NAVNODEINFO. The navigator.go handlers for these are already registered; several are partially implemented but return hardcoded/stub data.

## Server (Go)
- Package: `internal/app/game/protocol/hh_navigator/`
- Inbound commands to implement (partially stubbed):
  - 16 `SUSERF` (handleGetOwnFlats) — already reads name and checks `habbo.Flats`; `habbo.Flats` needs to be populated from DB on login; add `loadHabboFlats(storage, habboID)` in habbo.go load sequence; return NOFLATSFORUSER if empty
  - 17 `SRCHF` (handleSearchFlats) — already calls `navigator.Filter(query)`; `Filter` needs to search DB rooms by name (LIKE query) and populate `NavigatorFlatCategoryNode.FlatList`; currently filter likely returns empty
  - 21 `GETFLATINFO` (handleGetFlatInfo) — currently returns placeholder strings; replace with actual DB lookup by `flatID`; return real name, owner, description, door state, max visitors
  - 23 `DELETEFLAT` (handleDeleteFlat) — currently sends SUCCESS(23) with no action; add DB delete of the room row and removal from navigator nodes; validate the caller is the room owner
  - 24 `UPDATEFLAT` (handleUpdateFlatInfo) — currently sends SUCCESS(24) with no action; parse the `/`-delimited string and update room fields in DB
  - 25 `SETFLATINFO` (handleSetFlatInfo) — currently sends SUCCESS(25) with no action; parse and persist description, max_visitors, door_state
  - 151 `GETUSERFLATCATS` (handleGetUserFlatCategories) — partially implemented; reads categories from navigator node; needs to fall back to DB-seeded categories
  - 153 `SETFLATCAT` (handleSetFlatCategory) — currently returns nil; persist the room's category change to DB
- Outbound commands (all registered): OWN_FLAT_RESULTS (16), SRC_FLAT_RESULTS (55), NOFLATSFORUSER (57), NOFLATS (58), FLATINFO (54), USERFLATCATS (221), FLATCAT (222), SUCCESS (225)
- DB changes needed: yes
  - Ensure Room table has `owner_id INT FK users_avatar` (from TICKET-001 schema)
  - Add sqlc queries: `GetRoomsByOwner`, `SearchRoomsByName`, `UpdateRoom`, `DeleteRoom`
- Virtual state changes:
  - `pkg/virtual/habbo.go`: add `loadFlats(storage, habboID)` to populate `Habbo.Flats []*NavigatorFlat` from DB on login
  - `pkg/virtual/navigator.go`: add `Filter(query string) []*NavigatorFlat` that queries DB via storage interface (currently may be in-memory only)

## Client (Godot)
- Scene/script: `client/hh_navigator/`
- Builds on the Navigator UI from TICKET-001.
- What to implement:
  - "My Rooms" tab: send SUSERF (16) with the player's own name; display OWN_FLAT_RESULTS in the room list
  - Search tab: text input field; on submit, send SRCHF (17); display SRC_FLAT_RESULTS
  - NOFLATSFORUSER (57) / NOFLATS (58): show "No rooms found" empty state in the list
  - Room categories dropdown: on Navigator open, send GETUSERFLATCATS (151); populate category filter from USERFLATCATS (221) response
  - Category filter: selecting a category sends NAVIGATE (150) with the category node ID
  - FLATINFO (54): display room info detail panel when a room row is clicked (name, owner, description, door state, visitor count)
  - Reference: `casts/hh_navigator/3_Navigator Window Interface Class.ls`, `casts/hh_navigator/66_nav_gr_src.window.txt`, `casts/hh_navigator/67_nav_gr_own.window.txt`

## Acceptance criteria
- [ ] "My Rooms" tab sends SUSERF and displays rooms owned by the logged-in user
- [ ] Rooms owned by the user are loaded from DB and present in the list after login
- [ ] Search input sends SRCHF; matching rooms appear in results; NOFLATS renders empty state
- [ ] FLATINFO response populates a detail panel with actual DB values (not placeholders)
- [ ] GETUSERFLATCATS returns real category list from DB/config
- [ ] SETFLATCAT persists the category change for the room in DB
- [ ] DELETEFLAT removes the room from DB; room no longer appears in own rooms list or search
- [ ] UPDATEFLAT persists name, door state, show-owner-name changes to DB
- [ ] Non-owner cannot delete or update another user's room (server rejects silently)

## Notes
- **Room creation is in TICKET-019 (kiosk).** Private rooms must be created via CREATEFLAT (29) before they can appear here. TICKET-009 is the browse/search/manage side; TICKET-019 is the create side. Both must be implemented together for the full private rooms flow.
- `handleGetOwnFlats` checks `name != habbo.Name` as a guard. This is the right approach but `habbo.Name` must be populated correctly from DB (currently hardcoded as `"$name"` in `habbo.load()`).
- The FLATINFO response format uses sequential protocol.String/Int args (not the raw tab-delimited format of flat result lists). Verify the client expects this format.
- Favorite rooms (GETFVRF/handleGetFavoriteFlats) is already implemented in the server using the in-memory `NavigatorCategoryNode` approach — persistence of favorites is a POST-MVP concern.
