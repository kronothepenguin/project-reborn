# TICKET-033: Room Events

**Priority:** POST-MVP
**Size:** M
**Affects:** Server / Client / DB
**Depends on:** TICKET-010

## Summary
Implement the in-room event system (`hh_room` event thread). Room owners can create an in-room event (CAN_CREATE_ROOMEVENT, 345; CREATE_ROOMEVENT, 346) — essentially tagging their room with an event title and description that appears in the Navigator. Active events are listed with special indicators. Users can rate rooms/events (ROOMEVENT_RATE, implied). This feature makes private rooms discoverable via the Navigator event category.

## Server (Go)
- Package: `internal/app/game/protocol/hh_room/`
- Inbound commands to implement:
  - 345 `CAN_CREATE_ROOMEVENT` — check if the calling user can create an event (has HC or meets other criteria); send ROOMEVENT_PERMISSION (367) with `can_create bool`
  - 346 `CREATE_ROOMEVENT` — read `type_id int`, `title string`, `description string`; INSERT into `room_events` table; update Navigator node for the room; broadcast ROOMEVENT_INFO (370) to room; add room to event listing in Navigator
  - 347 `EDIT_ROOMEVENT` — update existing active event for the room
  - 348 `DELETE_ROOMEVENT` — delete the event; remove event listing from Navigator
  - 349 `ROOMEVENT_RATE` — read `rating int` (1–5); update room's `room_rating` in DB; broadcast ROOM_RATING (345) to room (note: same ID — verify in Lingo)
- Outbound commands to register:
  - 367 `ROOMEVENT_PERMISSION` — `can_create bool`, `reason string`
  - 368 `ROOMEVENT_TYPES` — list of available event types: `num_types int`, per type: `id int`, `name string`, `description string`
  - 369 `ROOMEVENT_LIST` — event listing (used in Navigator): list of rooms with active events
  - 370 `ROOMEVENT_INFO` — event details for the current room: `type_id int`, `title string`, `description string`, `active bool`
  - 345 `ROOM_RATING` — `rating int`; broadcast to room when rating changes
- DB changes needed: yes
  - New table `room_events`: `id INT PK AUTOINCREMENT`, `room_id INT FK rooms`, `type_id INT`, `title TEXT`, `description TEXT`, `is_active BOOL DEFAULT TRUE`, `created_at DATETIME`
  - New table `room_event_types`: `id INT PK`, `name TEXT`, `description TEXT`
  - Add column to `rooms`: `room_rating INT DEFAULT 0`
  - Add sqlc queries: `CreateRoomEvent`, `GetActiveEvent`, `UpdateRoomRating`

## Client (Godot)
- Scene/script: `client/hh_room/room.gd`, `client/hh_navigator/`
- Reference: `casts/hh_room/5_Room Handler Class.ls` — handle_roomevent_permission, handle_roomevent_info
- What to implement:
  - Room event creation panel: in the room owner's room settings, a "Create Event" button; sends CAN_CREATE_ROOMEVENT (345) first; if permitted, show event form (type dropdown, title, description); submit sends CREATE_ROOMEVENT (346)
  - On ROOMEVENT_INFO (370): show event badge in the room header with title; visible to all users
  - Event listing in Navigator: a "Events" tab that requests ROOMEVENT_LIST (369); shows rooms with active events
  - Room rating: "Rate this room" stars widget; on rating, sends ROOMEVENT_RATE; on ROOM_RATING broadcast, update the displayed rating

## Acceptance criteria
- [ ] CAN_CREATE_ROOMEVENT returns ROOMEVENT_PERMISSION correctly based on user status
- [ ] CREATE_ROOMEVENT inserts event into DB and broadcasts ROOMEVENT_INFO to all room users
- [ ] Event badge is visible in the room header
- [ ] Active event room appears in the Navigator Events tab
- [ ] DELETE_ROOMEVENT removes event from DB and Navigator listing
- [ ] Room rating updates DB and broadcasts ROOM_RATING to room users
- [ ] ROOMEVENT_TYPES returns available types seeded from DB

## Notes
- ROOM_RATING (345) ID collision with CAN_CREATE_ROOMEVENT (345) must be verified in Lingo `regMsgList`. They may have different actual IDs.
- Event type seed data should reflect original Habbo event types (e.g. "Party", "Game", "Other").
- This feature requires HC membership for event creation in the original — gate with `HasClub()` from TICKET-020 for MVP.
