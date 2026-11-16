---
type: Task
title: reborn stops in order
description: On Ctrl-C or SIGTERM reborn stops taking requests, logs every player out and closes the game's listeners, stops the scheduled tasks and closes the database, with new Shutdown and Stop functions.
scope: [packages/server, packages/scheduler, packages/reborn, apps/server]
depends_on: [05-reborn-installs-a-new-hotel]
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

- [ ] `(*server.Server).Shutdown(ctx) error`: closes the info and mus listeners, logs every session's habbo out with
  `game.Logout`, closes the connections, and waits for them until `ctx` ends.
- [ ] `scheduler.Stop()`: no task starts again, and it waits for the runs in progress.
- [ ] reborn's `Run`, when its context ends: `http.Server.Shutdown` with 10 seconds, the game's `Shutdown`,
  `scheduler.Stop()`, then the database closes. `main.go` passes a context from `signal.NotifyContext` for
  `os.Interrupt` and `syscall.SIGTERM`, as `apps/reborn/cmd/reborn/main.go` does.
- [ ] `apps/server/cmd/server/main.go` replaces `select {}` with waiting for the signal, then the game's `Shutdown`,
  `scheduler.Stop()` and `db.Close()`.
- [ ] Tests: `Shutdown` logs a habbo in a room out and its last time online is saved; `Stop` waits for a running task
  and starts no other; reborn's `Run` returns after its context ends, with the ports closed.

# Checks

```sh
make -C packages/server check
make -C packages/scheduler check
make -C packages/reborn check
```

Then `make check` in every project that `make dependants project=<folder>` prints for `packages/server`,
`packages/scheduler`, `packages/reborn`.
