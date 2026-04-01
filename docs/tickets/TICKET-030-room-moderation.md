# TICKET-030: Room Moderation (Kick, Ban, Ignore)

**Priority:** MVP-2
**Size:** S
**Affects:** Server / Client / DB
**Depends on:** TICKET-011

## Summary
Implement in-room moderation actions: kicking (KICKUSER, 95), banning (BANUSER, 320), ignoring (IGNOREUSER, 319), and the moderator fuse check (YOUAREMOD, 70). These are distinct from TICKET-011 which covers room rights (controller role) — moderation here covers the owner's and fuse-admin's power to forcibly remove users. Also implements the ignore list so players can block chat from specific users.

## Server (Go)
- Package: `internal/app/game/protocol/hh_room/`
- Inbound commands to implement:
  - 95 `KICKUSER` — read `user_id int`; validate caller is room owner OR has Hobba/admin fuse; find target session in room; send DOOR_OUT (89) to target; force target through QUIT flow; broadcast LOGOUT (29) to room
  - 320 `BANUSER` — read `user_id int`, `duration string` (e.g. `"perm"`, `"1h"`, `"1d"`); validate caller has rights; INSERT into `room_bans` table; then kick same as KICKUSER; check ban on future TRYFLAT by that user
  - 319 `IGNOREUSER` — read `user_id int`; add to `session.Habbo.IgnoreList`; persist to `ignore_list` table; send IGNORE_RESULT (420) back confirming ignore
  - 318 `UNIGNOREUSER` — read `user_id int`; remove from ignore list; persist; send IGNORE_RESULT (420)
  - 317 `GET_IGNORE_LIST` — read and return full `IGNORE_LIST` (419) for the session user
- Outbound commands to register:
  - 419 `IGNORE_LIST` — `num_ignored int`, then per user: `user_name string`
  - 420 `IGNORE_RESULT` — `result int` (0=ignored, 1=unignored, 2=error)
  - 70 `YOUAREMOD` — already registered; sent to a user granted controller rights; also sent to Hobba-rank users on login
- DB changes needed: yes
  - `room_bans` table: covered in TICKET-011 (add `duration string`)
  - New table `ignore_list`: `user_id INT FK users_avatar`, `ignored_user_id INT FK users_avatar`; composite PK
  - Add sqlc queries: `GetIgnoreList`, `AddIgnore`, `RemoveIgnore`
- Virtual state changes:
  - `pkg/virtual/habbo.go`: add `IgnoreList map[int]bool`; load from DB on login; add `Ignores(userID int) bool`
  - Chat broadcast in hh_room: before delivering CHAT (52) to a session, check if the sender is in the recipient's `IgnoreList` — skip if so

## Client (Godot)
- Scene/script: `client/hh_room/room.gd`, `client/hh_room_ui/context_menu.gd`
- What to implement:
  - Right-click context menu on avatars: show "Kick", "Ban", "Ignore" options based on caller's role
    - "Kick" / "Ban": visible only to room owner and fuse-admin; send KICKUSER (95) / BANUSER (320)
    - "Ignore": visible to all; sends IGNOREUSER (319); chat from that user is hidden locally
  - On YOUAREMOD (70): show notification "You are a room moderator"; update the local rights state to enable kick/ban UI
  - Ignore list management: accessible from settings or friends panel; shows IGNORE_LIST (419); allow unignoring
  - On IGNORE_RESULT (420): toast notification confirming ignore/unignore

## Acceptance criteria
- [ ] Room owner can kick a user; kicked user receives DOOR_OUT and is removed from room
- [ ] Ban persists in DB; banned user's TRYFLAT is rejected on next attempt
- [ ] IGNOREUSER hides that user's chat for the ignoring player only
- [ ] Ignore list is loaded from DB on login; persists across sessions
- [ ] GET_IGNORE_LIST returns the full current list as IGNORE_LIST (419)
- [ ] UNIGNOREUSER removes from ignore list; chat from that user is visible again
- [ ] Non-owner attempting KICKUSER is rejected server-side (no action)
- [ ] YOUAREMOD is sent to Hobba-rank users on login (they have fuse override in all rooms)

## Notes
- Fuse-admin vs room rights: a Hobba-rank user (from TICKET-021) can kick in ANY room without needing explicit rights from the owner. Implement this check in the KICKUSER handler using `habbo.Rank >= HobbaRank`.
- Ban duration parsing: accept `"perm"` (permanent, NULL expires_at), `"1h"`, `"1d"` etc. using `time.ParseDuration` or custom parsing.
- Ignore filtering happens server-side in the chat broadcast: check ignorer's `IgnoreList` before sending. This prevents a crafty client from circumventing the ignore by packet inspection.
