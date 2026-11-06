---
type: Decision
title: The server listens as server.info and server.mus, each on a TCP port, a WebSocket path or both
description: config.json gives the client's two connections, info and mus, a TCP port and a WebSocket path each, either or both; info speaks r26, and the rest of 0007 stands.
status: superseded
superseded_by: "0020"
timestamp: 2026-11-06T19:11:02+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-06T19:11:02+00:00"}
tags: [protocol, config]
---

# Decision

- `config.json` holds the server's listeners as the client's two connections:
  `"server": {"info": {"port": 30000, "path": "/client/info"}, "mus": {"port": 30001, "path": "/client/mus"}}`.
- `port` is a TCP port, and `path` a WebSocket route on the HTTP mux the server is mounted on: its own HTTP server when
  it runs alone, the orchestrator's mux under the orchestrator. A connection has a port, a path or both, so the server
  runs on TCP only, on WebSocket only, or on both.
- `info` is the game's connection and speaks r26. `mus` is the connection of the Multiuser Xtra's messages.
- The defaults are the user's: TCP 30000 and 30001, and the paths `/client/info` and `/client/mus`.
- The rest of [0007](/decisions/0007-protocols-per-listener.md) stands. The R26 protocol is the Go package `r26`
  (`packages/server/r26`). r18 stays a door left open, as a package of its own. Whether r18 and r26 players share one
  hotel is documented both ways and settled when r18 starts, which also settles how r18's connections enter
  `config.json`.

# Context

Supersedes [0007](/decisions/0007-protocols-per-listener.md), whose listeners were a list in which each TCP address or
WebSocket path named its protocol. Asked s0-04's open question, the user answered: "i like the server.info.port and
server.mus.port but i also want path for each one. my idea about server supporting both tcp and websocket is to be able
to have that, only tcp, only ws or both tcp and ws. i already tested before with another client and the previous game
server, i can have tcp info in 30000 and tcp mus in 30001 but ws info in /client/info and ws mus in /client/mus mounted
as routes in the orchestractor http mux." The user chose 30000 and 30001 as the default ports, and said: "server is
server, one thing, and libreshockwave is client side only".

# Consequences

- LibreShockwave opens each socket at the host and port the movie passes to `connectToNetServer`
  (`vendor/LibreShockwave/cpp/src/lingo/xtra/multiuser_xtra.cpp`), which the R26 client takes from `connection.info.*`
  and `connection.mus.*`, and it adds one path, the page's `websocketPath`, to every socket
  (`vendor/LibreShockwave/web/libreshockwave-cpp-worker.js`). As shipped it cannot reach `/client/info` and
  `/client/mus` on one host and port. How it does is a question of `plans/client`'s C1, not of the server.
- [s0-04](/tasks/s0-04-listener-config.md) adds the section, and [s0-07](/tasks/s0-07-r26-sessions.md) serves it.
