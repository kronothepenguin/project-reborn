---
type: Decision
title: The server lives in packages/server, and virtual holds only state
description: packages/server is one Go module with the transport, the encoding, the r26 protocol and the protocol-free game rules, and packages/virtual holds only the server's state.
status: accepted
timestamp: 2026-11-05T20:57:45+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T20:57:45+00:00"}
tags: [server, packages, architecture]
---

# Decision

```text
packages/server/          Go module: the game server
  server.go               New(db), serving TCP, Mount(mux) for the WebSocket
  transport/              Conn = Reader + Writer + Closer; tcp.go, websocket.go
  encoding/               B64, VL64 and strings
  r26/                    R26 ids and one file per client cast
    entry_init.go navigator.go room.go ...
  game/                   rules: login, entering rooms, chat, walking... with no protocol in them
packages/virtual/         state only: settings/, habbos/, rooms/, furni/ ...
```

- `encoding` stands apart from `r26`, so that another protocol can reuse it.
- `game` holds the rules and never knows the protocol. It is its own package so that `r26` can call it without an
  import cycle.
- `packages/virtual` holds only state, one package per entity, as `virtual/settings` does
  ([0009](/decisions/server/0009-virtual-holds-the-server-state.md)).

# Context

Offered everything in `packages/server`, `r26` as its own module, the rules inside `virtual`, or the old server's
layout, where each cast's handler read the packet, changed `virtual` and wrote the reply, the user chose everything in
`packages/server`. The names `game/` and the per-cast file names were offered as placeholders, and the user kept them.

# Consequences

- Each package's README describes it once it exists.
- Which entity packages `virtual` gets, and their names, is settled by the phase that needs each one.
