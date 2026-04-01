# TICKET-019: Room Kiosk - Create Flat

**Priority:** MVP-2
**Size:** S
**Affects:** Server / Client / DB
**Depends on:** TICKET-009

## Summary
Implement the room-creation kiosk (`hh_kiosk_room`) so that a logged-in Habbo can open the kiosk dialog, fill in a room name and door state, send CREATEFLAT (29), and receive a `flatcreated` (59) response containing the new room's ID. This is the only way a user can create a private room; without it, private room browsing (TICKET-009) has no rooms to show.

## Server (Go)
- Package: `internal/app/game/protocol/hh_kiosk_room/`
- Inbound commands to implement:
  - 29 `CREATEFLAT` — read `name string`, `description string`, `door string` (open/closed/password), `model string`; validate name (non-empty, ≤25 chars); INSERT room row into DB; assign `owner_id = session.Habbo.ID`; add new `NavigatorFlat` to `hotel.Navigator` flat category node; add flat to `session.Habbo.Flats`; send flatcreated (59)
  - 353 `WEB_SHORTCUT` — read shortcut string; if shortcut is `"navigator/create"`, trigger kiosk open via session; respond with webShortcut ack
- Outbound commands to register:
  - 59 `FLATCREATED` — returns `flatID int`, `name string`
  - 33 `ERROR` — already registered in navigator; reuse for "name already taken" or "max rooms reached" errors
- DB changes needed: yes
  - INSERT into `rooms` using extended schema from TICKET-001: `name`, `owner_id`, `door_state`, `model`, `description`, `max_visitors`, `is_public=FALSE`, `category_id`
  - Add sqlc query: `CreateRoom` (returns inserted ID)
- Virtual state changes:
  - `pkg/virtual/hotel.go`: add helper `AddFlatToNavigator(flat *NavigatorFlat, categoryID int)` to insert flat into the correct `NavigatorFlatCategoryNode`
  - `pkg/virtual/habbo.go`: after room creation, append to `Habbo.Flats` so SUSERF returns it immediately

## Client (Godot)
- Scene/script: `client/hh_kiosk_room/`
- Reference: `casts/hh_kiosk_room/` — check for Interface/Component/Handler .ls files
- What to implement:
  - `hh_kiosk_room.gd` — registers with `message_bus` for FLATCREATED (59) and ERROR (33)
  - `kiosk_window.tscn` — dialog with fields: room name (LineEdit), description (TextEdit), door dropdown (open/closed/password), model selector; "Create" button sends CREATEFLAT (29)
  - On FLATCREATED (59): close the kiosk dialog; open the Navigator or directly navigate to the new room
  - On ERROR (33): show inline error message in the kiosk dialog without closing
  - Cross-cast trigger: on `executeMessage(#open_roomkiosk)` from web shortcut or menu, open the kiosk window

## Acceptance criteria
- [ ] "Create Room" button in Navigator or Hotel View opens the kiosk dialog
- [ ] Submitting a valid room name and door state sends CREATEFLAT (29)
- [ ] Server inserts the room in DB and responds with FLATCREATED (59) containing the new room ID
- [ ] New room appears immediately in the user's "My Rooms" list (SUSERF)
- [ ] Duplicate room name returns ERROR (33); dialog remains open with error message
- [ ] Created room is visible in the navigator flat category for all users
- [ ] Room is assigned the correct owner (session user ID) in DB
- [ ] Server restart preserves the room (persisted to DB)

## Notes
- The kiosk is a separate cast (`hh_kiosk_room`, cast entry #15) from the navigator. Register handlers in a new Go package `hh_kiosk_room`, not inside `hh_navigator`.
- `model` is the heightmap model name (e.g. `"model_a"` — the default 7×7 flat). For MVP, hardcode the default model; model selection UI is post-MVP.
- TICKET-009 depends on rooms existing in the DB; TICKET-019 is what creates them.
