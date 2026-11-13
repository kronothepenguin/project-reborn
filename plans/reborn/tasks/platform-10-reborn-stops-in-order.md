---
type: Task
title: reborn stops in order
description: On Ctrl-C or SIGTERM reborn stops taking requests, logs every player out and closes the game's listeners, stops the scheduled tasks and closes the database, with new Shutdown and Stop functions.
status: todo
slice: platform
depends_on: [platform-05]
packages: [packages/server, packages/scheduler, packages/reborn]
sources: []
timestamp: 2026-11-13T15:20:00-05:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-13T15:20:00-05:00"}
---

# Goal

Players are logged out and nothing is cut halfway when reborn stops ([0007](/decisions/0007-reborn-stops-in-order.md)).

# Steps

- [ ] `(*server.Server).Shutdown(ctx) error`: closes the info and mus listeners, logs every session's habbo out with
  `game.Logout`, closes the connections, and waits for them until `ctx` ends.
- [ ] `scheduler.Stop()`: no task starts again, and it waits for the runs in progress.
- [ ] reborn's `Run`, when its context ends: `http.Server.Shutdown` with 10 seconds, the game's `Shutdown`,
  `scheduler.Stop()`, then the database closes. `main.go` passes a context from `signal.NotifyContext` for `os.Interrupt`
  and `syscall.SIGTERM`; if [platform-03](/tasks/platform-03-reborn-runs-an-installed-hotel.md)'s `main.go` does not
  yet, write the change under `# Notes` for the coordinator to ask.
- [ ] `apps/server/cmd/server/main.go` is the user's file: write under `# Notes` the change that replaces `select {}`
  with waiting for the signal, then the game's `Shutdown`, `scheduler.Stop()` and `db.Close()`, and stop for the
  coordinator to ask.
- [ ] Tests: `Shutdown` logs a habbo in a room out and its last time online is saved; `Stop` waits for a running task and
  starts no other; reborn's `Run` returns after its context ends, with the ports closed.

# Verification

```sh
cd packages/server && go vet ./... && go test ./... -race
cd packages/scheduler && go vet ./... && go test ./... -race
cd packages/reborn && go vet ./... && go test ./... -race
make gates
```

Results: written here once run.

# Notes

- Runs on the branch `platform-10`.
