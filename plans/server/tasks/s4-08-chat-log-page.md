---
type: Task
title: Read the chat history in housekeeping
description: Housekeeping gets a chat log page behind housekeeping.chatLogs, by room or habbo, and lines older than game.chatHistoryDays are deleted.
status: done
phase: s4
depends_on: [s4-05]
packages: [packages/housekeeping, packages/store]
client: []
timestamp: 2026-11-10T20:19:22+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-10T16:42:08+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-10T20:19:22+00:00"}
---

# Goal

Staff read what was said in rooms, for as long as it is kept ([0066](/decisions/0066-staff-read-the-chat-history-30-days.md)).

# Steps

- [x] A housekeeping page behind `housekeeping.chatLogs` searches the chat history by room or by habbo, as HoloCMS's
  `chatlogs.php` did, newest first.
- [x] Lines older than `game.chatHistoryDays` are deleted on a schedule.
- [x] Tests.

# Verification

```sh
cd packages/housekeeping && go test ./... -race
make gates
```

Results:

- The user settled the page's questions: the game server prunes the chat hourly
  ([0084](/decisions/0084-the-game-server-prunes-the-chat-hourly.md)), the viewer lists 100 lines a page
  ([0085](/decisions/0085-the-chat-log-viewer-pages-by-100.md)), and public rooms are marked in its Room ID column
  ([0086](/decisions/0086-the-chat-log-marks-public-rooms.md)).
- `GET /housekeeping/chatlogs`, behind `housekeeping.chatLogs`, is HoloCMS's Chat Log Viewer, linked as `Chatlogs`
  under Logs & Statistics after Staff Logs, as HoloCMS's menu had it: the box Chat Log Search, "Room ID OR Username",
  "Search string for the chat log viewer.", the button "Retrive logs", "Now showing chat logs.." or "Nothing found.",
  and Search Results with Username, Room ID, Time and Message, newest first. The search is a GET, so that Newer and
  Older keep it, where HoloCMS posted it; a room's id finds the lines of the public room and the habbo room of that id,
  `Public 101` and `101`, a deleted room's lines show `-`, and a name finds a habbo's lines in any case, as HoloCMS's
  MySQL compared it.
- The store has `CountChatLog` and `SearchChatLog`, documented in the rooms' queries.
- `game.PruneChat` deletes the lines older than `game.chatHistoryDays`; `server.New` runs it at once and every hour
  through the scheduler, once the database updates are applied, and logs how many lines went.
- The HoloCMS port's references now say that the chat log page is ported; `Online Users` still waits.
- In `packages/store`, `TestSearchingTheChatLog`; in housekeeping, `TestChatLogsNeedTheirAttribute`,
  `TestChatLogsFindARoomOrAHabbo` and `TestChatLogsComeInPagesOfAHundred`; in `game`,
  `TestPruneChatKeepsThirtyDays`. The store, housekeeping and server suites pass with `-race`, and `make check-docs`
  exits 0.

# Notes

- Runs on the branch `s4-chat-log-page`.
