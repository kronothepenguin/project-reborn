---
type: Task
title: Drop the game server's unused HTTP listener
description: The HTTP server that apps/server starts on port 15445 goes, with the route and the router behind it, and the runner keeps running on its two WebSocket listeners.
status: todo
slice: platform
depends_on: []
packages: [packages/server, apps/server]
sources: []
timestamp: 2026-11-13T00:42:05+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-13T00:42:05+00:00"}
---

# Goal

The game server listens only where the client connects.

The user: "server has an unused http server because of the template i think in the port 15445. you can remove it."

# Steps

- [ ] `packages/server/server.go` loses `Mount` and its import of the router; `packages/server/internal/router/` goes.
- [ ] `apps/server/cmd/server/main.go` loses its mux and its `http.Server`, and blocks after `StartInfo` and `StartMus`,
  which serve in goroutines.
- [ ] `packages/server/README.md` and `apps/server/README.md` no longer name the port 15445 or `Mount`.
- [ ] `make dev` in `apps/server` still starts the two listeners and keeps running.

# Verification

```sh
cd packages/server && go vet ./... && go test ./... -race
cd apps/server && go vet ./... && go build ./...
make gates
```

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
