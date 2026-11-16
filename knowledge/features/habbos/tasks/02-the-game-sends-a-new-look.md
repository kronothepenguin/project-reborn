---
type: Task
title: Send a habbo's new look and motto from the game
description: (*server.Server).SendLook reads a habbo again and, when it is online, updates the copy the game holds and shows the new figure, gender and motto to the habbo and to everyone in its room, with the client's own messages.
scope: [packages/server, packages/virtual]
depends_on: []
skills: [applying-go-patterns, testing-behaviours, use-modern-go]
---

# Goal

The game shows a look or motto changed outside it at once
([0013](/decisions/reborn/0013-a-habbos-look-and-motto-reach-the-game-at-once.md)). The behaviours of the spec:

- A habbo in a room has its look or motto changed outside the game: it and every habbo in the room see the new look
  and motto at once.
- A habbo is online and in no room when its look changes: it sees the new look wherever the client shows its own
  figure, and enters its next room with it.
- A habbo is offline when its look changes: the game sends nothing, and the habbo logs in with the new look.
- A habbo logged in again elsewhere: a change shows in the new session, and the session it replaced gets nothing.

# Context

- [Spec](/features/habbos/spec.md)
- [Plan](/features/habbos/plan.md)
- `packages/services/knowledge/index.md`: the contract `services.Habbos` and the rules of a service.
- `packages/server/knowledge/layout.md`: the supporting packages sit under `packages/server/internal/`.
- `packages/client-r26/src/game/`
- `packages/server/knowledge/r26/hh_room.md`
- `packages/server/knowledge/r26/hh_entry_init.md`
- `packages/server/knowledge/r26/hh_human.md`
- [A habbo's look and motto reach the game at once, from wherever they
  change](/decisions/reborn/0013-a-habbos-look-and-motto-reach-the-game-at-once.md)
- Holo's MUS did this with `UPRA` (`source/holoemu/`, a reference only:
  [server 0016](/decisions/server/0016-holoemu-is-a-reference.md)).
- The user on the second behaviour: "Whatever the client can show at once". The task finds where the hotel view shows
  the habbo's own figure and reports it.

# Steps

- [ ] Find in the client's `.ls` scripts which messages update a habbo's own figure and motto, and a room's view of
  another habbo, and how the client applies them
  ([server 0008](/decisions/server/0008-reverse-engineer-ls-only.md); scripts with CR line ends are read through
  `tr '\r' '\n'`). Find also where the client shows the habbo's own figure outside a room, and which message updates
  it there. Add what the references of `packages/server/knowledge/r26/` lack.
- [ ] `(*server.Server).SendLook(ctx, avatarID) error`: read the avatar from the store; when the habbo is offline,
  return; otherwise update the copy the game holds (`habbo.Update` of `packages/virtual/habbo`, which refuses a
  session that a second login replaced) and send the new look and motto to the habbo and to its room, through the
  events of `internal/game` and the messages of `internal/r26`. `*server.Server` satisfies `services.Habbos`.
- [ ] One test per behaviour of the goal, with the fake sessions of the `r26` tests.
- [ ] Update `packages/server/knowledge` with what `SendLook` does and which messages it sends.

# Checks

```sh
make -C packages/server check
make -C packages/virtual check
```

Then `make check` in every project that `make dependants project=<folder>` prints for `packages/server`,
`packages/virtual`.
