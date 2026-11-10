---
type: Task
title: Read the chat history in housekeeping
description: Housekeeping gets a chat log page behind housekeeping.chatLogs, by room or habbo, and lines older than game.chatHistoryDays are deleted.
status: todo
phase: s4
depends_on: [s4-05]
packages: [packages/housekeeping, packages/store]
client: []
timestamp: 2026-11-10T16:42:08+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-10T16:42:08+00:00"}
---

# Goal

Staff read what was said in rooms, for as long as it is kept ([0066](/decisions/0066-staff-read-the-chat-history-30-days.md)).

# Steps

- [ ] A housekeeping page behind `housekeeping.chatLogs` searches the chat history by room or by habbo, as HoloCMS's
  `chatlogs.php` did, newest first.
- [ ] Lines older than `game.chatHistoryDays` are deleted on a schedule.
- [ ] Tests.

# Verification

```sh
cd packages/housekeeping && go test ./... -race
make gates
```

# Notes

- Runs on the branch `s4-chat-log-page`.
