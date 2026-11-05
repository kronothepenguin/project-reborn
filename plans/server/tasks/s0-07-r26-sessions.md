---
type: Task
title: Serve R26 sessions
description: The server starts every listener with the protocol it names, and r26 frames packets, sends HELLO, dispatches packets by id and logs the ones it does not handle yet.
status: todo
phase: s0
depends_on: [s0-04, s0-05, s0-06, s1-02]
packages: [packages/server, apps/server]
client: ["packages/client-r26/src/game/fuse_client/51_Connection Instance Class.ls", "packages/client-r26/src/game/hh_entry_init/8_Login Handler Class.ls"]
timestamp: 2026-11-05T20:57:45+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T20:57:45+00:00"}
---

# Goal

An R26 client that connects over TCP or WebSocket receives `HELLO`, and every packet it sends is read, dispatched by
id, and logged when nothing handles it yet ([0007](/decisions/0007-protocols-per-listener.md)).

# Steps

- [ ] Ask the user S0's open questions for this task: what the server logs for each packet, and the change to
  `apps/server/cmd/**` that serves the TCP listeners beside the HTTP server, which belongs to the user. Record the
  answers as decisions.
- [ ] The server starts every listener of `config.json` with the protocol it names, and refuses to start with a name
  it does not know.
- [ ] `Mount(mux)` mounts the WebSocket paths on the mux it is given.
- [ ] `r26` reads a packet (3 B64 characters of length, 2 of id, the body), writes one (2 B64 characters of id, the
  body, `chr(1)`), sends `HELLO` when a client connects, and runs the handler registered for an id.
- [ ] `r26` knows the names of the commands of [s1-02](/tasks/s1-02-entry-init.md)'s document. A packet with no
  handler is logged, by name when `r26` knows it, and the session goes on.
- [ ] Each session reads and handles its packets in order in its own goroutine, and sessions never wait on each
  other, unlike the old registry ([The old server](/reference/old-server.md#problems-found-while-planning)).
- [ ] A Go test client, for tests only, speaks R26 over TCP and WebSocket.
- [ ] Tests: over both transports the test client receives `HELLO`, sends `INIT_CRYPTO`, and the log names it; a
  malformed length closes that session only; an unknown protocol name stops the start.
- [ ] `packages/server/README.md` describes how a connection goes.

# Verification

```sh
cd packages/server && gofmt -l . && go vet ./... && go test ./... -race
make gates
```

# Notes

- Runs on the branch `s0`.
