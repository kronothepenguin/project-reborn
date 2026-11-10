---
type: Task
title: Chat, whisper, shout, dance, wave and type
description: CHAT, WHISPER and SHOUT reach the room as 24, 25 and 26 and are saved; typing, dances and waves show; a habbo's ignore list hides others' chat from it.
status: todo
phase: s4
depends_on: [s4-03]
packages: [packages/server]
client: ["packages/client-r26/src/game/hh_room/4_Room Component Class.ls", "packages/client-r26/src/game/hh_room/5_Room Handler Class.ls", "packages/client-r26/src/game/hh_room_utils/25_Chat Manager.ls"]
timestamp: 2026-11-10T16:42:08+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-10T16:42:08+00:00"}
---

# Goal

Habbos talk and show themselves in a room ([hh_room_utils](/reference/r26/hh_room_utils.md), Chat).

# Steps

- [ ] `CHAT` (52) reaches the room as 24, `SHOUT` (55) as 26, and `WHISPER` (56) only the named habbo and the speaker
  as 25; each line is saved ([0066](/decisions/0066-staff-read-the-chat-history-30-days.md)).
- [ ] `USER_START_TYPING` (317) and `USER_CANCEL_TYPING` (318) show as 361.
- [ ] `DANCE` (93), its club dances only with `fuse_use_club_dance`, `WAVE` (94) and `STOP` (88) show in the habbo's
  status.
- [ ] `IGNOREUSER` (319), `UNIGNORE_USER` (322) and `GET_IGNORE_LIST` (321) keep the habbo's ignore list, 419 and 420; an
  ignored habbo's chat does not reach it.
- [ ] Tests with the Go test client.

# Verification

```sh
cd packages/server && go test ./... -race
make gates
```

# Notes

- Runs on the branch `s4-chat-and-gestures`.
