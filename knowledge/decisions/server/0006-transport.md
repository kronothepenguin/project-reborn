---
type: Decision
title: TCP and WebSocket are one byte-stream Conn, and the WebSocket mounts on any HTTP mux
description: The protocol code sees every connection as an io.Reader to receive and an io.Writer to send, TCP and golang.org/x/net/websocket both provide them, and the WebSocket is an http.Handler mounted with Mount(mux).
status: accepted
timestamp: 2026-11-05T20:57:45+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T20:57:45+00:00"}
tags: [server, transport, architecture]
---

# Decision

```go
type Conn interface {
    io.Reader // receive
    io.Writer // send
    io.Closer
    RemoteAddr() string
}

type Handler func(Conn)
```

- TCP: the server serves a `net.Listener`.
- WebSocket: an `http.Handler` built on `golang.org/x/net/websocket`, which the server mounts with `Mount(mux)`, so
  that the server's own HTTP server, or later the orchestrator's mux, hosts it.
- The protocol frames its own packets (R26: a length prefix coming in, `chr(1)` going out), so a WebSocket frame does not
  have to be one packet.

# Context

The user: "use interface to communicate with io", "i expect to have tcp and websocket support" and "provide a way out to
be hable mount the server in a http server for the websocket alternative".

Offered a byte stream like the old server's or whole packets, they chose the byte stream. Offered
`golang.org/x/net/websocket`, `github.com/coder/websocket` or `github.com/gorilla/websocket`, they chose the first: the
Go team's package, which the old server used and whose connection is already a reader and a writer. Go 1.27 has no
WebSocket package of its own.

# Consequences

- [s0-05](/tasks/s0-05-transport.md) writes the transport.
