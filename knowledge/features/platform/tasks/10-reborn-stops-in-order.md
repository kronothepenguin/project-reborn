---
type: Task
title: reborn stops in order
description: On Ctrl-C or SIGTERM reborn stops taking requests, logs every player out and closes the game's listeners, stops the scheduled tasks and closes the database, with the game's Stop and a new scheduler stop.
scope: [packages/server, packages/scheduler, packages/reborn, apps/server]
depends_on: [hotel-status/01-the-game-starts-stops-and-answers]
skills: []
---

# Goal

Players are logged out and nothing is cut halfway when reborn stops
([0007](/decisions/reborn/0007-reborn-stops-in-order.md)).

# Context

- [Spec](/features/platform/spec.md)
- [Plan](/features/platform/plan.md)
- [reborn stops in order](/decisions/reborn/0007-reborn-stops-in-order.md)

# Steps

- [ ] The game stops with its own `Stop(ctx)`, built by
  [hotel status](/features/hotel-status/plan.md), which closes the listeners and logs every habbo out.
- [ ] `scheduler.Stop()`: no task starts again, and it waits for the runs in progress.
- [ ] reborn's `Run`, when its context ends: `http.Server.Shutdown` with 10 seconds, the game's `Stop`,
  `scheduler.Stop()`, then the database closes. `main.go` passes a context from `signal.NotifyContext` for
  `os.Interrupt` and `syscall.SIGTERM`, as `apps/reborn/cmd/reborn/main.go` does.
- [ ] `apps/server/cmd/server/main.go` replaces `select {}` with waiting for the signal, then the game's `Stop`,
  `scheduler.Stop()` and `db.Close()`.
- [ ] Tests: `scheduler.Stop` waits for a running task
  and starts no other; reborn's `Run` returns after its context ends, with the ports closed.

# Checks

```sh
make -C packages/server check
make -C packages/scheduler check
make -C packages/reborn check
```

Then `make check` in every project that `make dependants project=<folder>` prints for `packages/server`,
`packages/scheduler`, `packages/reborn`.
