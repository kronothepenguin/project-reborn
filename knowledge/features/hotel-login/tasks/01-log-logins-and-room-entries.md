---
type: Task
title: Log logins and room entries in the game
description: The game server writes one log line when a habbo logs in and one when a habbo enters a room, with ids and names only.
scope: [packages/server]
depends_on: []
skills: [applying-go-patterns, testing-behaviours, use-modern-go]
---

# Goal

The game's own log tells what happened ([Plan](/features/hotel-login/plan.md), its last decision). The behaviours of
the spec:

- A habbo logs in: the game's log names the habbo.
- A habbo enters a room: the game's log names the habbo and the room.

# Context

- [Spec](/features/hotel-login/spec.md)
- [Plan](/features/hotel-login/plan.md)
- `packages/server/knowledge/architecture.md` and `layout.md`: where the login and the room entry are handled.
- The log leaves every packet's body out, and names commands it does not handle: the new lines follow the same form
  as the lines the server writes today.

# Steps

- [ ] One `slog` line at `Info` when a login succeeds, with the habbo's id and name.
- [ ] One `slog` line at `Info` when a habbo is let into a room, with the habbo's id and name and the room's id and
  name.
- [ ] One test per behaviour of the goal, with a log writer guarded against the other goroutines of the tests.
- [ ] Update `packages/server/knowledge`.

# Checks

```sh
make -C packages/server check
```

Then `make check` in every project that `make dependants project=<folder>` prints for `packages/server`. The browser
suites start the game server and fail on a log line they do not expect: run `make e2e`, and add the two new lines to
the run's banners or expected lines as `tests/e2e/knowledge/rules-of-a-run.md` describes.
