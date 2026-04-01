# TICKET-011: Room Access Control

**Priority:** MVP-2
**Size:** M
**Affects:** Server / Client
**Depends on:** TICKET-002

## Summary
Implement the room access control system: doorbell for closed rooms, password challenge for password-protected rooms, room rights (operator status) assignment and removal, kicking users, and banning. These mechanics are essential for private room hosts to moderate their rooms and for the correct entry flow of non-open rooms.

## Server (Go)
- Package: `internal/app/game/protocol/hh_room/`
- Inbound commands to implement (currently stubs):
  - 57 `TRYFLAT` — read `flatID string` and optionally `password string`; look up room; check `door_state`: if `"open"` proceed to GOTOFLAT flow; if `"locked"` send DOORBELL_RINGING (91) to room owner(s) and wait for LETUSERIN; if `"password"` validate password and send FLATPASSWORD_OK (130) or FLATNOTALLOWEDTOENTER (131); if room full send CANTCONNECT (224)
  - 98 `LETUSERIN` — read `userName string, allow bool`; if allow, complete room entry for the waiting session (send OPC_OK etc.); if deny, send FLATNOTALLOWEDTOENTER (131) to the waiting session
  - 96 `ASSIGNRIGHTS` — read `userID int`; validate caller is room owner; add userID to `Room.Rights` list; send YOUAREMOD (70) to the target session; broadcast ROOM_RIGHTS (42) update to room
  - 97 `REMOVERIGHTS` — remove userID from `Room.Rights`; send update; also handles 155 `REMOVEALLRIGHTS` (all rights from all non-owner users)
  - 95 `KICKUSER` — read `userID int`; validate caller has rights; send DOOR_OUT (89) to the kicked session; force the kicked session through the QUIT flow; broadcast LOGOUT (29) to room
  - 320 `BANUSER` — read `userID int, duration string`; persist ban to a `room_bans` table; kick the user; check ban on TRYFLAT entry
- Outbound commands (already registered): DOORBELL_RINGING (91), FLATPASSWORD_OK (130 — via navigator), FLATNOTALLOWEDTOENTER (131), YOUAREMOD (70), ROOM_RIGHTS (42), ROOM_RIGHTS_2 (43), ROOM_RIGHTS_3 (47), DOOR_OUT (89), CANTCONNECT (224)
- DB changes needed: yes
  - New table `room_rights`: `room_id INT FK`, `user_id INT FK users_avatar`; composite PK
  - New table `room_bans`: `room_id INT FK`, `user_id INT FK users_avatar`, `expires_at DATETIME`
  - Add sqlc queries: `GetRoomRights`, `AddRoomRight`, `RemoveRoomRight`, `RemoveAllRoomRights`, `AddRoomBan`, `GetActiveBan`
- Virtual state changes:
  - `pkg/virtual/room.go`: add `Rights map[int]bool` (userID -> has rights), `Bans map[int]time.Time`; add `HasRights(userID int) bool`, `IsOwner(userID int) bool`
  - `pkg/virtual/room.go`: add `WaitingQueue []*Habbo` for doorbell pending entries

## Client (Godot)
- Scene/script: `client/hh_room/room.gd`, `client/hh_room_utils/dialog.gd`
- `client/hh_room_utils/dialog.gd` is a stub — use it for the doorbell/password dialogs.
- What to implement:
  - Doorbell waiting dialog: when trying to enter a locked room, show "Waiting for host to let you in" modal with cancel button; on FLATNOTALLOWEDTOENTER, dismiss and show rejection message; on OPC_OK, dismiss and proceed with room entry
  - Password dialog: when TRYFLAT response indicates password required (or based on room door_state from FLATINFO), show password input field; send TRYFLAT again with password; on FLATPASSWORD_OK, proceed; on FLATNOTALLOWEDTOENTER, show "Wrong password"
  - Doorbell notification: on DOORBELL_RINGING (91), if the local user is the room owner, show alert with username and "Let in / Reject" buttons; send LETUSERIN accordingly
  - Room rights UI: if local user is room owner, right-click context menu on other users shows "Give Rights" / "Remove Rights" / "Kick" / "Ban"; send appropriate packets
  - YOUAREMOD on receiving: show "You have been given room rights" notification; enable rights-holder UI controls (move furniture, kick)
  - Reference: `casts/hh_navigator/70_nav_gr_password.window.txt`, `casts/hh_navigator/71_nav_gr_trypassword.window.txt`, `casts/hh_room_utils/dialog.gd`

## Acceptance criteria
- [ ] Attempting to enter a locked room sends TRYFLAT and displays a waiting dialog
- [ ] Room owner receives DOORBELL_RINGING with the requester's name
- [ ] Accepting via LETUSERIN completes room entry for the requester
- [ ] Denying via LETUSERIN shows rejection message to the requester
- [ ] Password-protected room: wrong password shows error; correct password allows entry
- [ ] ASSIGNRIGHTS sends YOUAREMOD to the target; target gains rights UI
- [ ] REMOVERIGHTS revokes moderator privileges; target's rights UI is hidden
- [ ] Kicking a user removes them from the room; they receive DOOR_OUT and are returned to Hotel View
- [ ] Banning a user persists to DB; subsequent TRYFLAT attempts from that user are rejected
- [ ] REMOVEALLRIGHTS removes rights from all non-owner users in the room

## Notes
- The FLATPASSWORD_OK (130) response is registered in hh_navigator, not hh_room — verify the client handles it in the right context (it is part of the entry flow).
- Doorbell waiting timeout: if no LETUSERIN response arrives within 60 seconds, auto-reject the waiter server-side.
- KICKUSER and BANUSER require that the kicker has room rights or is the owner; the server must check this before acting.
- DOOR_OUT is sent to the kicked user's session only; LOGOUT (29) is broadcast to all remaining users.
- **Fuses permission levels (affects ASSIGNRIGHTS, REMOVERIGHTS, KICKUSER, BANUSER):**
  - Owner fuse: full control — assign/remove rights, kick, ban, place/move all furni
  - Controller fuse (has rights): can kick; may move/remove furni (configurable); cannot ban or assign rights to others
  - Fuse-admin / Hobba rank: overrides room ownership — can kick in any room, force door states; granted at server level not by room owner
  - When checking permissions, prefer explicit fuse checks (`room.IsOwner`, `room.HasRights`, `habbo.Rank >= HobbaRank`) over cascading boolean flags
- Kick/ban from outside a room (Hobba admin tool) is covered in TICKET-021 (moderation); this ticket covers in-room rights only.
