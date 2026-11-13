---
type: Task
title: The game sends a habbo's new look and motto
description: (*server.Server).SendLook reads a habbo again and, when it is online, updates the copy the game holds and shows the new figure, gender and motto to the habbo and to everyone in its room, with the client's own messages.
status: todo
slice: habbos
depends_on: [habbos-01]
packages: [packages/server, packages/virtual]
sources: ["packages/client-r26/src/game/", "plans/server/reference/r26/hh_room.md", "plans/server/reference/r26/hh_entry_init.md", "plans/server/reference/r26/hh_human.md"]
timestamp: 2026-11-13T15:20:00-05:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-13T15:20:00-05:00"}
---

# Goal

The game shows a look or motto changed outside it at once
([0013](/decisions/0013-a-habbos-look-and-motto-reach-the-game-at-once.md)).

# Steps

- [ ] Find in the client's `.ls` scripts which messages update a habbo's own figure and motto, and a room's view of
  another habbo, and how the client applies them
  (`plans/server/decisions/0008-reverse-engineer-ls-only.md`; scripts with CR line ends are read through
  `tr '\r' '\n'`). Add what the references of `plans/server/reference/r26/` lack.
- [ ] `(*server.Server).SendLook(ctx, avatarID) error`: read the avatar from the store; if the habbo is offline, return;
  otherwise update the copy the game holds (`habbo.Update`, which refuses when a second login took the session) and
  send the new look and motto to the habbo and to its room, through `game`'s events and the `r26` messages.
  `*server.Server` satisfies `services.Habbos`.
- [ ] Tests with the `r26` tests' fake sessions: a habbo alone, a habbo in a room with another, a habbo offline, a
  second login meanwhile.

# Verification

```sh
cd packages/server && go vet ./... && go test ./... -race
cd packages/virtual && go vet ./... && go test ./... -race
make gates
```

Results: written here once run.

# Notes

- Runs on the branch `habbos-02`.
- Holo's MUS did this with `UPRA` (`source/holoemu/`, a reference only: `plans/server/decisions/0016-holoemu-is-a-reference.md`).
