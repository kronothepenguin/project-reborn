---
type: Task
title: Serve R26 sessions
description: The server runs a WebSocket listener on the host and port of server.info and of server.mus, and on info r26 frames packets, sends HELLO, dispatches packets by id and logs the ones it does not handle yet.
status: todo
phase: s0
depends_on: [s0-04, s0-05, s0-06, s1-02]
packages: [packages/server, apps/server]
client: ["packages/client-r26/src/game/fuse_client/51_Connection Instance Class.ls", "packages/client-r26/src/game/hh_entry_init/8_Login Handler Class.ls"]
timestamp: 2026-11-05T20:57:45+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T20:57:45+00:00"}
---

# Goal

An R26 client that connects to the `info` WebSocket listener receives `HELLO`, and every packet it sends is read,
dispatched by id, and logged when nothing handles it yet ([0020](/decisions/0020-info-and-mus-websocket-ports.md)).

# Steps

- [x] Ask the user S0's open questions for this task, and record the answers as decisions: what the server logs for
  each packet ([0021](/decisions/0021-unhandled-packets-logged-by-id-name-and-size.md)); how the runner, which
  belongs to the user, starts the listeners ([0022](/decisions/0022-start-info-and-start-mus.md)); and what the `mus`
  listener does before [S7](/phases/s7-club-help-extras.md) ([0023](/decisions/0023-mus-listener-before-s7.md)).
- [ ] `StartInfo` and `StartMus`, methods of the `Server` of `packages/server`, each open a WebSocket listener, the
  transport's `WebSocket` handler, on the host and port of `server.info` or `server.mus`
  ([0020](/decisions/0020-info-and-mus-websocket-ports.md)), return an error when they cannot listen, and then serve
  in the background ([0022](/decisions/0022-start-info-and-start-mus.md)); `info` speaks r26.
- [ ] `apps/server/cmd/server/main.go` calls both after `c := server.New(db)`, with exactly the lines of
  [0022](/decisions/0022-start-info-and-start-mus.md), and nothing else under `apps/**/cmd/**` changes.
- [ ] `r26` reads a packet (3 B64 characters of length, 2 of id, the body), writes one (2 B64 characters of id, the
  body, `chr(1)`) and refuses a body that holds `chr(1)`, which only the framing can check
  ([s0-06](/tasks/s0-06-encoding.md)), sends `HELLO` when a client connects, and runs the handler registered for an
  id.
- [ ] `r26` knows the names of the commands of [s1-02](/tasks/s1-02-entry-init.md)'s document. A packet with no
  handler is logged as one line, with the session's address, the id, the name when `r26` knows it and the body's
  size, never the body ([0021](/decisions/0021-unhandled-packets-logged-by-id-name-and-size.md)), and the session
  goes on.
- [ ] Each session reads and handles its packets in order in its own goroutine, and sessions never wait on each
  other, unlike the old registry ([The old server](/reference/old-server.md#problems-found-while-planning)).
- [ ] The `mus` listener accepts the WebSocket, logs the connect, the size of each message and the close, and never
  answers ([0023](/decisions/0023-mus-listener-before-s7.md)).
- [ ] A Go test client, for tests only, speaks R26 over WebSocket.
- [ ] Tests: on the `info` listener the test client receives `HELLO`, sends `INIT_CRYPTO`, and the log names it
  without the body; a malformed length closes that session only; the `mus` listener logs what it receives and
  answers nothing; `StartInfo` and `StartMus` return an error when they cannot listen.
- [ ] `packages/server/README.md` describes how a connection goes.

# Verification

```sh
cd packages/server && gofmt -l . && go vet ./... && go test ./... -race
make gates
```

# Notes

- Runs on the branch `s0`.
