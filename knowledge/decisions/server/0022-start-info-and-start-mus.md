---
type: Decision
title: StartInfo and StartMus start the listeners
description: packages/server defines StartInfo and StartMus, which open the listeners of server.info and server.mus, return an error when they cannot listen and then serve in the background; the standalone runner calls both, and the orchestrator will call the same two.
status: accepted
timestamp: 2026-11-07T00:12:36+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-07T00:12:36+00:00"}
tags: [server, packages, runner]
---

# Decision

- `packages/server` defines `StartInfo` and `StartMus`. Each opens its listener on the host and port of `server.info`
  or `server.mus` ([0020](/decisions/server/0020-info-and-mus-websocket-ports.md)), returns an error when it cannot listen,
  and then serves in the background.
- The standalone runner, `apps/server/cmd/server/main.go`, calls both, and the orchestrator (`plans/later.md`) will
  later call the same two.
- The runner gains exactly these lines, placed after `c := server.New(db)`:

```go
if err := c.StartInfo(); err != nil {
	log.Fatalln(err)
}
if err := c.StartMus(); err != nil {
	log.Fatalln(err)
}
```

# Context

The user: "Please define something like StartInfo and StartMus, this way we hace the same code for the standalone and
the orchestractor later".

Asked whether the two calls may be added to `apps/server/cmd/server/main.go`, which belongs to the user, the user chose
"Yes, edit main.go (Recommended)", for exactly the lines above, placed after `c := server.New(db)`.

# Consequences

- Those lines are the only change s0-07 makes to the runner.
- The orchestrator starts the listeners with the same two calls.
