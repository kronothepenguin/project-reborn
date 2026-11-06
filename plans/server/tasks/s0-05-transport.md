---
type: Task
title: Write the transport
description: packages/server/transport gives TCP and WebSocket connections one Conn interface, an io.Reader to receive and an io.Writer to send, with the WebSocket as an http.Handler on golang.org/x/net/websocket.
status: done
phase: s0
depends_on: [s0-03]
packages: [packages/server]
client: []
timestamp: 2026-11-06T17:19:17-05:00
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-06T17:19:17-05:00"}
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T20:57:45+00:00"}
---

# Goal

TCP and WebSocket clients reach the protocol code as the same `Conn` ([0006](/decisions/0006-transport.md)).

# Steps

- [x] The WebSocket writes binary frames and reads binary or text frames, as LibreShockwave does
  ([0015](/decisions/0015-client-on-libreshockwave.md)).
- [x] `transport.Conn` and `transport.Handler` as [0006](/decisions/0006-transport.md) writes them.
- [x] TCP: serve a `net.Listener`, one goroutine per connection, and return cleanly when the listener closes.
- [x] WebSocket: an `http.Handler` on `golang.org/x/net/websocket` whose connections are `Conn`s, with the client's
  address as `RemoteAddr`.
- [x] Tests over loopback: TCP and WebSocket each carry bytes both ways, including data split over several reads or
  frames, and either end can close.
- [x] `packages/server/README.md` describes the transport.

# Verification

```sh
cd packages/server && gofmt -l . && go vet ./... && go test ./transport/... -race
```

Run on 2026-11-06: `gofmt -l .` lists nothing, `go vet ./...` reports nothing, and the tests pass:

```text
ok  	github.com/kronothepenguin/project-reborn/packages/server/transport	1.021s
```

`transport_test.go` runs each test over TCP and over a WebSocket on loopback: a packet sent in two writes or frames,
two packets in one read in pieces of 3, the server's two writes received as binary frames, the client closing
(`Read` returns `io.EOF`), the server closing from another goroutine while `Read` waits, the connection closing once
the handler returns, and `RemoteAddr` equal to the client's address. It also checks that text frames are read as
their bytes, that the WebSocket refuses a request without an `Origin` header, and that `ServeTCP` returns nil once
its listener closes and the error of any other failed `Accept`.

# Notes

- Runs on the branch `s0`.
- The old transport: `git show 2ea51d7b^:packages/server/internal/transport/websocket.go` and the files beside it
  ([The old server](/reference/old-server.md)).
- Whether the server trusts a reverse proxy's forwarded address (`X-Forwarded-For`) is not decided: `RemoteAddr` is
  the HTTP request's `RemoteAddr` as Go gives it.
- A text frame is read as its bytes, as the `Conn.Read` of `golang.org/x/net/websocket` gives them
  ([0006](/decisions/0006-transport.md)). LibreShockwave sends binary frames only.
- For [s0-07](/tasks/s0-07-r26-sessions.md): `ServeTCP` returns any failed `Accept` but a closed listener's, where
  `net/http` retries the temporary ones; a panic in a handler ends the process over TCP, while `net/http` recovers
  it over a WebSocket; and `http.Server.Shutdown` does not close the WebSockets, whose connections are hijacked.
