---
type: Task
title: Add the rooms' saved data
description: The store gets room rights, room bans, room votes, the chat history and the ignore lists; the attribute that reads the chat history and S4's settings join the catalogues.
status: done
phase: s4
depends_on: []
packages: [packages/store, packages/auth, packages/virtual, packages/housekeeping]
client: []
timestamp: 2026-11-10T16:55:01+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-10T16:42:08+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-10T16:55:01+00:00"}
---

# Goal

What a room keeps between visits is saved ([0011](/decisions/0011-saved-and-memory-only-data.md)).

# Steps

- [x] Tables for room rights, room bans with their end ([0067](/decisions/0067-a-room-ban-lasts-15-minutes.md)), each
  habbo's vote on a room, the chat history, naming a public room or a habbo room, the speaker, the kind of line, its
  text and its time ([0066](/decisions/0066-staff-read-the-chat-history-30-days.md)), and each habbo's ignored habbos;
  an update with them.
- [x] The attribute `housekeeping.chatLogs` in `packages/auth`'s catalogue, granted by the update to the groups and users
  that manage access, as a new attribute must be.
- [x] The settings `game.roomBanMinutes`, 15, `game.chatHistoryDays`, 30, and `game.loadingAdImage`,
  `game.loadingAdLink`, `game.roomAdImage` and `game.roomAdLink`, empty
  ([0070](/decisions/0070-a-loading-ad-and-a-room-ad-from-settings.md)), in the catalogue and the Game form.
- [x] The named queries S4's tasks need, tests, and the OKF concepts, with the `adding-data-persistence` skill.

# Verification

```sh
cd packages/store && go vet ./... && go test ./... && make check-docs
cd packages/auth && go test ./... -race
cd packages/virtual && go test ./... -race
cd packages/housekeeping && go test ./... -race
make gates
```

Results:

- `packages/store/schema/rooms.schema.sql` declares `room_rights`, `room_bans`, with the ban's end
  ([0067](/decisions/0067-a-room-ban-lasts-15-minutes.md)), `room_votes`, a vote of 1 or -1 once per habbo,
  `chat_messages` ([0066](/decisions/0066-staff-read-the-chat-history-30-days.md)) and `ignored_habbos`. A chat line
  names a public room or a habbo room, at most one; its kind is `chat`, `whisper` or `shout`, a whisper names its habbo,
  and a deleted habbo room leaves its lines without a room, so that deleting a room never erases what was said in it.
- The update `0011-room-life.sql`, not automatic, creates them and grants `housekeeping.chatLogs` to every group and
  user holding `housekeeping.accessGroups`, as `0004-database-attribute.sql` did for `housekeeping.database`.
- `rooms.query.sql` holds 16 named operations: rights, all removed at once with the habbos who lost them; a ban, which
  a new one replaces, its end while it holds, and the ended ones deleted; a first vote and the room's rating; a chat
  line, and the lines before a time deleted; and the ignore list. s4-08 adds the chat log page's searches.
- `packages/auth` has the attribute `housekeeping.chatLogs`, "reading the chat history of rooms".
- The settings `game.roomBanMinutes` 15, from 1 to 10080 (a week), `game.chatHistoryDays` 30, from 1 to 3650, and
  `game.loadingAdImage`, `game.loadingAdLink`, `game.roomAdImage` and `game.roomAdLink`, empty or an absolute http or
  https URL ([0070](/decisions/0070-a-loading-ad-and-a-room-ad-from-settings.md)), are in the catalogue and
  housekeeping's Game form. A URL with a control character is refused, so no tab can split 258's image from its link.
- In `packages/store`, `go vet ./...` and `go test ./...` pass, with `TestRoomRights`, `TestARoomBanEnds`,
  `TestAHabboVotesOnARoomOnce`, `TestTheChatHistoryOutlivesItsRoom`, `TestAnIgnoreList`,
  `TestTheDatabaseAttributeReachesThoseWhoManageAccess` and `TestTheUpdatesBuildTheDatabaseTheSchemaFilesDescribe`;
  `make check-docs` exits 0; regenerating leaves the generated files unchanged. `packages/auth` (`TestCatalogue`),
  `packages/virtual` (`TestTheGameSettingsHoldTheirDefaults`, `TestAnAdIsEmptyOrAnAbsoluteURL`) and
  `packages/housekeeping` (`TestTheGameFormHoldsTheClientsSettings`) pass with `-race`.
- The OKF concepts of the schema, the queries, the update, the five tables and the chat message entity are added; the
  room, habbo and access group entities name what they gained.

# Notes

- Runs on the branch `s4-room-tables`.
