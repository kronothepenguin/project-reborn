---
type: Go Package
title: Transport
description: How packages/server/transport carries a client's bytes over TCP or a WebSocket as a Conn.
tags: [server]
---

`transport` carries a client's bytes over TCP or a WebSocket
(`knowledge/decisions/server/0006-transport.md`). Both reach the protocol as a
`Conn`: `Read` receives, `Write` sends, `Close` closes and `RemoteAddr` is the
client's address. The protocol frames its own packets, so neither a read nor a
WebSocket frame has to be one packet.

- `ServeTCP(l, h)` serves each connection `l` accepts with the `Handler` `h`, in
  a goroutine of its own. It returns nil once `l` is closed, and the error of any
  other failed `Accept`, a temporary one included, which `net/http` retries instead.
- `WebSocket(h)` is an `http.Handler` on `golang.org/x/net/websocket`, mounted
  on any mux. It writes binary frames and reads the bytes of binary and text
  frames alike. Like `websocket.Handler`, it refuses a request whose `Origin`
  header is missing or not a URL. `RemoteAddr` is the HTTP request's
  `RemoteAddr`. Whether the server trusts a reverse proxy's `X-Forwarded-For`
  is an open question.
- A connection closes once its handler returns. Either end may close it sooner:
  the handler's `Read` returns `io.EOF` when the client closes, and `Close`
  from another goroutine ends a `Read` that is waiting.
- A `Conn`'s methods may be called from several goroutines at once.
