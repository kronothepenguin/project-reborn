---
type: Task
title: Write the transport
description: packages/server/transport gives TCP and WebSocket connections one Conn interface, an io.Reader to receive and an io.Writer to send, with the WebSocket as an http.Handler on golang.org/x/net/websocket.
status: todo
phase: s0
depends_on: [s0-03]
packages: [packages/server]
client: []
timestamp: 2026-11-05T20:57:45+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T20:57:45+00:00"}
---

# Goal

TCP and WebSocket clients reach the protocol code as the same `Conn` ([0006](/decisions/0006-transport.md)).

# Steps

- [ ] Ask the user S0's open question for this task: text or binary WebSocket frames. Record the answer as a decision.
- [ ] `transport.Conn` and `transport.Handler` as [0006](/decisions/0006-transport.md) writes them.
- [ ] TCP: serve a `net.Listener`, one goroutine per connection, and return cleanly when the listener closes.
- [ ] WebSocket: an `http.Handler` on `golang.org/x/net/websocket` whose connections are `Conn`s, with the client's
  address as `RemoteAddr`.
- [ ] Tests over loopback: TCP and WebSocket each carry bytes both ways, including data split over several reads or
  frames, and either end can close.
- [ ] `packages/server/README.md` describes the transport.

# Verification

```sh
cd packages/server && gofmt -l . && go vet ./... && go test ./transport/... -race
```

# Notes

- Runs on the branch `s0`.
- The old transport: `git show 2ea51d7b^:packages/server/internal/transport/websocket.go` and the files beside it
  ([The old server](/reference/old-server.md)).
