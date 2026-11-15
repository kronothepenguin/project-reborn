---
type: Task
title: The game sends a habbo's new look and motto
description: (*server.Server).SendLook reads a habbo again and, when it is online, updates the copy the game holds and shows the new figure, gender and motto to the habbo and to everyone in its room, with the client's own messages.
scope: [packages/server, packages/virtual]
depends_on: [01-services-and-inject]
skills: []
---

# Goal

The game shows a look or motto changed outside it at once
([0013](/decisions/reborn/0013-a-habbos-look-and-motto-reach-the-game-at-once.md)).

# Context

- [Spec](/features/habbos/spec.md)
- [Plan](/features/habbos/plan.md)
- `packages/client-r26/src/game/`
- `packages/server/knowledge/r26/hh_room.md`
- `packages/server/knowledge/r26/hh_entry_init.md`
- `packages/server/knowledge/r26/hh_human.md`
- [A habbo's look and motto reach the game at once, from wherever they
  change](/decisions/reborn/0013-a-habbos-look-and-motto-reach-the-game-at-once.md)
- Holo's MUS did this with `UPRA` (`source/holoemu/`, a reference only:
  [server 0016](/decisions/server/0016-holoemu-is-a-reference.md)).

# Steps

- [ ] Find in the client's `.ls` scripts which messages update a habbo's own figure and motto, and a room's view of
  another habbo, and how the client applies them
  ([server 0008](/decisions/server/0008-reverse-engineer-ls-only.md); scripts with CR line ends are read through
  `tr '\r' '\n'`). Add what the references of `packages/server/knowledge/r26/` lack.
- [ ] `(*server.Server).SendLook(ctx, avatarID) error`: read the avatar from the store; if the habbo is offline, return;
  otherwise update the copy the game holds (`habbo.Update`, which refuses when a second login took the session) and
  send the new look and motto to the habbo and to its room, through `game`'s events and the `r26` messages.
  `*server.Server` satisfies `services.Habbos`.
- [ ] Tests with the `r26` tests' fake sessions: a habbo alone, a habbo in a room with another, a habbo offline, a
  second login meanwhile.

# Checks

```sh
make -C packages/server check
make -C packages/virtual check
```

Then `make check` in every project that `make dependants project=<folder>` prints for `packages/server`,
`packages/virtual`.
