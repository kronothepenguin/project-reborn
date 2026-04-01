# TICKET-026: Photo System

**Priority:** POST-MVP
**Size:** S
**Affects:** Server / Client
**Depends on:** TICKET-002

## Summary
Implement the photo/snapshot feature (`hh_photo` cast). The client can take a screenshot of the room, encode it, and send it to the server for storage and display on in-room photo frames (wall furniture). The server also tracks how many "films" (photo credits) the player has. This is a passive feature dependent on room furniture being in place.

## Server (Go)
- Package: `internal/app/game/protocol/hh_photo/`
- Inbound commands:
  - 83 `TAKE_PHOTO` — client signals intent to take a photo; server checks film count > 0; decrements film count; sends PHOTO_APPROVED (84) authorizing the client to encode and submit
  - 85 `SUBMIT_PHOTO` — read `room_id int`, `photo_data string` (base64 or URL); store photo metadata in DB; broadcast PHOTO_RESULT (86) to room with photo display reference
- Outbound commands to register:
  - 84 `PHOTO_APPROVED` — server approves the photo request: `film_count int` (remaining after this shot)
  - 86 `PHOTO_RESULT` — sent to room after photo submitted: `photo_id int`, `owner_name string`, `thumbnail_url string`
  - 87 `FILM_COUNT` — sent after login and after each photo: `film_count int`
- DB changes needed: yes
  - Add column to `users_avatar`: `film_count INT DEFAULT 0`
  - New table `photos`: `id INT PK AUTOINCREMENT`, `owner_id INT FK users_avatar`, `room_id INT FK rooms`, `photo_url TEXT`, `taken_at DATETIME`
  - Add sqlc queries: `GetFilmCount`, `DecrementFilmCount`, `InsertPhoto`

## Client (Godot)
- Scene/script: `client/hh_photo/`
- Reference: `casts/hh_photo/` — Interface/Component/Handler .ls files
- What to implement:
  - `hh_photo.gd` — registers for FILM_COUNT (87); on receipt, updates the film counter in the room HUD
  - Camera button in room HUD: visible only if `film_count > 0`; on click, sends TAKE_PHOTO (83)
  - On PHOTO_APPROVED (84): capture the current room viewport as an image; send SUBMIT_PHOTO (85)
  - On PHOTO_RESULT (86): briefly display a "Photo taken by [owner]!" toast in the room chat
  - Film counter display: shows remaining films next to the camera button

## Acceptance criteria
- [ ] FILM_COUNT is sent after login; camera button is visible if count > 0
- [ ] Clicking the camera button sends TAKE_PHOTO; server responds with PHOTO_APPROVED
- [ ] Client captures viewport and sends SUBMIT_PHOTO; photo is stored in DB
- [ ] PHOTO_RESULT is broadcast to the room with the owner name
- [ ] Film count decrements by 1 per photo; camera button hides when count reaches 0
- [ ] Film count persists across server restarts

## Notes
- Command IDs 83–87 need verification from `casts/hh_photo/` Handler regMsgList — they may overlap with room command IDs.
- Photo data storage: for MVP, store only metadata (owner, room, timestamp) in DB. The actual image file can be a Godot export to local disk or omitted entirely — the PHOTO_RESULT broadcast is the important part.
- Film count can be topped up via DB directly for MVP; in-game film purchase is post-MVP.
