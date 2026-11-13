---
type: Task
title: reborn stops in order
description: On Ctrl-C or SIGTERM reborn stops taking requests, logs every player out and closes the game's listeners, stops the scheduled tasks and closes the database, with new Shutdown and Stop functions.
scope: [packages/server, packages/scheduler, packages/reborn]
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
  `os.Interrupt` and `syscall.SIGTERM`; if
  [platform 03](/features/platform/tasks/03-reborn-runs-an-installed-hotel.md)'s `main.go` does not yet, write the
  change in the report for the master to ask.
- [ ] `apps/server/cmd/server/main.go` is the user's file: write in the report the change that replaces `select {}`
  with waiting for the signal, then the game's `Shutdown`, `scheduler.Stop()` and `db.Close()`, and stop for the
  master to ask.
- [ ] Tests: `Shutdown` logs a habbo in a room out and its last time online is saved; `Stop` waits for a running task
  and starts no other; reborn's `Run` returns after its context ends, with the ports closed.

# Checks

```sh
cd packages/server && go vet ./... && go test ./... -race
cd packages/scheduler && go vet ./... && go test ./... -race
cd packages/reborn && go vet ./... && go test ./... -race
make gates
```
