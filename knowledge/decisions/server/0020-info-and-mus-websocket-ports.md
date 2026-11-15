---
type: Decision
title: info and mus each listen as a WebSocket on a host and port of their own
description: config.json gives info and mus a host and a port each, and the server runs a WebSocket listener on each, which is what LibreShockwave opens; TCP and WebSocket paths wait for later.
status: accepted
timestamp: 2026-11-06T17:30:45-05:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-06T17:30:45-05:00"}
tags: [protocol, config]
---

# Decision

- `config.json` holds the two connections as a host and a port each:
  `"server": {"info": {"host": "localhost", "port": 30000}, "mus": {"host": "localhost", "port": 30001}}`. `host`
  works like `cms.host`.
- On each port the server runs its own WebSocket listener. TCP for a native Shockwave client, and WebSocket paths on
  another HTTP mux, wait for later.
- The rest of [0019](/decisions/server/0019-info-and-mus-listeners.md) stands: `info` is the game's connection and speaks
  r26, `mus` is the connection of the Multiuser Xtra's messages, and the rest of
  [0007](/decisions/server/0007-protocols-per-listener.md) stands with it (the `r26` package, r18 a door left open).

# Context

Supersedes [0019](/decisions/server/0019-info-and-mus-listeners.md), whose connections each had a TCP port and a WebSocket
path. Asked how `config.json` would switch one of them off, the user answered: "as our earlier discussion, actually
libreshockwave connects to host:port, i believe it uses websockets somehow but don't know how, i mean, it does not
have a path. so just keep host port for now".

LibreShockwave runs `new WebSocket("ws://host:port")` (`wss` on https pages), followed by the page's
`websocketPath`, which is empty unless the page sets it (`vendor/LibreShockwave/web/libreshockwave-cpp-worker.js`,
`socketUrlFor` and the connect handler). A browser cannot open plain TCP.

Asked what the server speaks on each port, the user chose "WebSocket": "The server runs its own WebSocket listener on
host:port, which is exactly what LibreShockwave opens, and the client plan runs on LibreShockwave (decision 0015). TCP
for a native Shockwave client waits for later."

# Consequences

- s0-04 declares `server.info.host`, `server.info.port`, `server.mus.host` and
  `server.mus.port`.
- s0-07 serves each connection as a WebSocket listener on its own host and port.
- The transport keeps TCP and the WebSocket handler of [0006](/decisions/server/0006-transport.md); only the WebSocket is
  served for now.
- [The client feature](/features/client/spec.md) no longer needs a path per socket: LibreShockwave reaches both ports from `connection.info.*`
  and `connection.mus.*`.
