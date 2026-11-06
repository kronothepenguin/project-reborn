---
type: Reference
title: How the server is built
description: The packages of the game server and what each one does, the path of a connection from a listener to the state, and how the server runs alone and under the orchestrator.
timestamp: 2026-11-06T17:32:58-05:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T20:57:45+00:00"}
tags: [server, architecture]
---

# Packages

| Package | Holds | Decisions |
| --- | --- | --- |
| `packages/server` | `New(db)`, and a WebSocket listener on the host and port of `server.info` and of `server.mus` | [0002](/decisions/0002-server-app.md), [0005](/decisions/0005-package-layout.md), [0020](/decisions/0020-info-and-mus-websocket-ports.md) |
| `packages/server/transport` | `Conn` (receive, send, close), TCP and the WebSocket on `golang.org/x/net/websocket` | [0006](/decisions/0006-transport.md) |
| `packages/server/encoding` | B64, VL64 and strings, shared by every protocol | [0005](/decisions/0005-package-layout.md) |
| `packages/server/r26` | The R26 ids, framing and handshake, and one file per client cast | [0007](/decisions/0007-protocols-per-listener.md), [0012](/decisions/0012-no-encryption.md) |
| `packages/server/game` | The rules of the hotel, with no protocol in them | [0005](/decisions/0005-package-layout.md) |
| `packages/virtual` | The state: hot data and temporary data, one package per entity | [0009](/decisions/0009-virtual-holds-the-server-state.md) |
| `packages/store` | The database: tables, queries and updates | [0010](/decisions/0010-hot-data-written-at-once.md), [0011](/decisions/0011-saved-and-memory-only-data.md) |
| `apps/server` | The runner | [0002](/decisions/0002-server-app.md) |

`game` never imports `r26`, so a second protocol needs no change to the rules.

# A connection

1. A listener, the WebSocket listener on the host and port that `config.json` gives `info` or `mus`, accepts a client
   and hands its `Conn` to the protocol of its connection: r26 on `info`
   ([0020](/decisions/0020-info-and-mus-websocket-ports.md)).
2. The protocol (`r26`) sends `HELLO`, reads packets, and runs the handler of the cast that owns each id.
3. The handler reads the fields and calls a rule in `game`.
4. The rule reads and changes the state in `virtual`. Saved data is written to the database at once, then in memory.
5. The protocol writes the answers back on the `Conn`.

How a rule tells the other habbos concerned, such as everyone in a room when one habbo talks, without knowing their
protocol, is designed when the first rules are written (S2).

# Running alone

`apps/server` runs the server on its own, as each program runs today: it opens the database named by `config.json`
and serves a WebSocket listener on the host and port of each connection
([0020](/decisions/0020-info-and-mus-websocket-ports.md)).

# Running together

Under the orchestrator (`plans/later.md`), one process runs the installer, the CMS, housekeeping and the server. The
server keeps a WebSocket listener on the host and port of each connection, and WebSocket paths on the orchestrator's
mux wait for later, as TCP does ([0020](/decisions/0020-info-and-mus-websocket-ports.md)). The CMS and housekeeping
change the virtual state directly ([0013](/decisions/0013-site-changes-like-mus.md)).

# Another protocol

r18 would be `packages/server/r18` and one more listener ([0007](/decisions/0007-protocols-per-listener.md)). Whether
its players share the hotel with r26 players, with one state and every event written by each player's protocol, or get
a hotel of their own, is settled when it starts.
