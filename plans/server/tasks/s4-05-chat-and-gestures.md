---
type: Task
title: Chat, whisper, shout, dance, wave and type
description: CHAT, WHISPER and SHOUT reach the room as 24, 25 and 26 and are saved; typing, dances and waves show; a habbo's ignore list hides others' chat from it.
status: done
phase: s4
depends_on: [s4-03]
packages: [packages/server]
client: ["packages/client-r26/src/game/hh_room/4_Room Component Class.ls", "packages/client-r26/src/game/hh_room/5_Room Handler Class.ls", "packages/client-r26/src/game/hh_room_utils/25_Chat Manager.ls"]
timestamp: 2026-11-10T18:12:43+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-10T16:42:08+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-10T18:12:43+00:00"}
---

# Goal

Habbos talk and show themselves in a room ([hh_room_utils](/reference/r26/hh_room_utils.md), Chat).

# Steps

- [x] `CHAT` (52) reaches the room as 24, `SHOUT` (55) as 26, and `WHISPER` (56) only the named habbo and the speaker
  as 25; each line is saved ([0066](/decisions/0066-staff-read-the-chat-history-30-days.md)).
- [x] `USER_START_TYPING` (317) and `USER_CANCEL_TYPING` (318) show as 361.
- [x] `DANCE` (93), its club dances only with `fuse_use_club_dance`, `WAVE` (94) and `STOP` (88) show in the habbo's
  status.
- [x] `IGNOREUSER` (319), `UNIGNORE_USER` (322) and `GET_IGNORE_LIST` (321) keep the habbo's ignore list, 419 and 420; an
  ignored habbo's chat does not reach it.
- [x] Tests with the Go test client.

# Verification

```sh
cd packages/server && go test ./... -race
make gates
```

Results:

- The user settled five open questions: chat reaches near habbos with its text and far ones as the client's unheard
  bubble ([0074](/decisions/0074-near-habbos-read-chat-far-ones-see-a-bubble.md)); talking, smileys and waves animate
  as Holo did ([0075](/decisions/0075-talking-smileys-and-waves-as-holo.md)); an ignore list holds 100, the oldest
  dropped ([0076](/decisions/0076-ignore-up-to-100-the-oldest-dropped.md)); the word filter waits in
  `plans/later.md` ([0077](/decisions/0077-the-word-filter-waits.md)); and a line is cut at 100 characters
  ([0078](/decisions/0078-a-chat-line-is-cut-at-100-characters.md)).
- `r26/room_utils.go` serves the Chat Manager: `CHAT` (52) answers 24 with the text within `game.chatRange` tiles
  each way, 5, as Holo's distance, and 24 with no text farther; `SHOUT` (55) 26 to everyone; `WHISPER` (56),
  `<name> <text>`, 25 to the named habbo and the speaker, and to nobody when the name is not in the room, as Holo had
  it. Each line keeps its first `game.chatMaxLength` characters and is saved in `chat_messages`, whispers with their
  habbo ([0066](/decisions/0066-staff-read-the-chat-history-30-days.md)). A habbo never gets the lines of a habbo it
  ignores.
- After each line the speaker shows `talk` for (letters + 50) x 30 ms, and a chat or a shout with a smiley shows its
  face for 5 s, in the order Holo's `checkEmotion` looked for them. `room.Status` has an end, `Until`, and the room's
  clock ends each timed status on its tick and sends the change.
- `USER_START_TYPING` (317) and `USER_CANCEL_TYPING` (318) send 361; a line ends the typing with 361 and 0 first, as
  Holo did. `DANCE` (93) starts the normal dance, or a club dance 1 to 4 with `fuse_use_club_dance`, never while
  sitting or lying; `WAVE` (94) waves for 1.5 s and stops the dance; `STOP` (88) `Dance` ends it.
- `IGNOREUSER` (319) and `UNIGNORE_USER` (322) answer 419 with 0, 1, 2 or 3 as the client's ignore list reads them,
  past `game.maxIgnoredHabbos` dropping the oldest; `GET_IGNORE_LIST` (321) answers 420. The online habbo keeps its
  ignore list, `Ignored`, which `Login` loads and the rules change after the store.
- The settings `game.chatRange` 5, `game.chatMaxLength` 100 and `game.maxIgnoredHabbos` 100 are in the catalogue and
  housekeeping's Game form.
- In `packages/server`, `go vet ./...` and `go test ./... -race` pass, with `TestChatShoutsAndWhispers`,
  `TestIgnoringAHabbo` and `TestDancingAndWaving`, three times in separate runs, and `game`'s `TestASmileyShowsItsFace`,
  `TestALineIsCutByCharacters` and `TestTimedStatusesEndOnTheirTick`; `packages/virtual` and housekeeping's settings
  tests pass.

# Notes

- Runs on the branch `s4-chat-and-gestures`.
