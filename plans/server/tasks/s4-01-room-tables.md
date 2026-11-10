---
type: Task
title: Add the rooms' saved data
description: The store gets room rights, room bans, room votes, the chat history and the ignore lists; the attribute that reads the chat history and S4's settings join the catalogues.
status: todo
phase: s4
depends_on: []
packages: [packages/store, packages/auth, packages/virtual, packages/housekeeping]
client: []
timestamp: 2026-11-10T16:42:08+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-10T16:42:08+00:00"}
---

# Goal

What a room keeps between visits is saved ([0011](/decisions/0011-saved-and-memory-only-data.md)).

# Steps

- [ ] Tables for room rights, room bans with their end ([0067](/decisions/0067-a-room-ban-lasts-15-minutes.md)), each
  habbo's vote on a room, the chat history, naming a public room or a habbo room, the speaker, the kind of line, its
  text and its time ([0066](/decisions/0066-staff-read-the-chat-history-30-days.md)), and each habbo's ignored habbos;
  an update with them.
- [ ] The attribute `housekeeping.chatLogs` in `packages/auth`'s catalogue, granted by the update to the groups and users
  that manage access, as a new attribute must be.
- [ ] The settings `game.roomBanMinutes`, 15, `game.chatHistoryDays`, 30, and `game.loadingAdImage`,
  `game.loadingAdLink`, `game.roomAdImage` and `game.roomAdLink`, empty
  ([0070](/decisions/0070-a-loading-ad-and-a-room-ad-from-settings.md)), in the catalogue and the Game form.
- [ ] The named queries S4's tasks need, tests, and the OKF concepts, with the `adding-data-persistence` skill.

# Verification

```sh
cd packages/store && go vet ./... && go test ./... && make check-docs
cd packages/auth && go test ./... -race
cd packages/virtual && go test ./... -race
cd packages/housekeeping && go test ./... -race
make gates
```

# Notes

- Runs on the branch `s4-room-tables`.
