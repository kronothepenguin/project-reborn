---
type: Task
title: Drop the game server's unused HTTP listener
description: The HTTP server that apps/server starts on port 15445 goes, with the route and the router behind it, and the runner keeps running on its two WebSocket listeners.
status: done
slice: platform
depends_on: []
packages: [packages/server, apps/server]
sources: []
timestamp: 2026-11-13T01:13:17+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-13T00:42:05+00:00"}
verified:
  - {by: claude-code/claude-fable-5-2, at: "2026-11-13T01:13:17+00:00"}
---

# Goal

The game server listens only where the client connects.

The user: "server has an unused http server because of the template i think in the port 15445. you can remove it."

# Steps

- [x] `packages/server/server.go` loses `Mount` and its import of the router; `packages/server/internal/router/` goes.
- [x] `apps/server/cmd/server/main.go` loses its mux and its `http.Server`, and blocks after `StartInfo` and `StartMus`,
  which serve in goroutines.
- [x] `packages/server/README.md` and `apps/server/README.md` no longer name the port 15445 or `Mount`.
- [x] `make dev` in `apps/server` still starts the two listeners and keeps running.

# Verification

```sh
cd packages/server && go vet ./... && go test ./... -race
cd apps/server && go vet ./... && go build ./...
make gates
```

Results:

- `packages/server/server.go` has no `Mount` and no router; `packages/server/internal/router/` is gone.
  `apps/server/cmd/server/main.go` starts the two listeners and ends in `select {}`, since both serve in the background.
- Both READMEs name the two WebSocket listeners and no HTTP port.
- In `packages/server`, `go vet ./...` and `go test ./... -race` pass, the whole suite. In `apps/server`, `go vet ./...`
  passes and the runner builds. `tools/create`'s tests pass: its backend template is unchanged.
- The built runner, started in an empty folder on two free ports, logged `server: info on ws://localhost:39100` and
  `server: mus on ws://localhost:39101` and was still running when stopped after four seconds. Nothing listens on 15445
  from it.
- `make gates` passes.

# Notes

- Runs on the branch `platform-01`.
- The files and lines are listed in [the orchestrator
  study](/reference/research-orchestrator.md#the-leftover-http-server-on-15445). Nothing uses the listener: no test, no
  suite, no other program.
- `apps/server/cmd/server/main.go` is the user's file; the user allowed this change with the words above. How `main`
  keeps running is the study's first question: it proposes `select {}`.
- The backend template of `tools/create` still generates an HTTP server; whether it changes is the study's second
  question, and not this task.
- The orchestrator needs this too: `Mount` registers `GET /{$}`, the site's own pattern, and one mux refuses both.
