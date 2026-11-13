---
type: Reference
title: Layout
description: The files and folders of packages/server, what each holds and the task that brought it.
tags: [server]
---

The game server is laid out as `knowledge/decisions/server/0005-package-layout.md`
decides. Each part is marked with the task of the server plan
that brings it. So far the package holds `server.go`, which `tools/create`
generated, the listeners of `server.go` and `mus.go`, `transport/`,
`encoding/`, `r26/` and `game/`. The HTTP route and the router that came with
the template are gone, dropped with the unused listener.

| Part | Holds | Brought by |
| --- | --- | --- |
| `server.go` | `New(db)`, which loads the settings and reloads them (`knowledge/decisions/server/0050-the-server-loads-and-reloads-the-settings.md`), and `StartInfo` and `StartMus`, which start a WebSocket listener on the host and port of `server.info` and of `server.mus` (`knowledge/decisions/server/0020-info-and-mus-websocket-ports.md`, `knowledge/decisions/server/0022-start-info-and-start-mus.md`) | s0-03 generated `New(db)`; s0-07 the listeners; s2-06 the settings |
| `mus.go` | What the `mus` listener does until S7 frames MUS: it logs and never answers (`knowledge/decisions/server/0023-mus-listener-before-s7.md`) | s0-07 |
| `transport/` | `Conn`, an `io.Reader` to receive, an `io.Writer` to send and an `io.Closer`, over TCP (`tcp.go`) and the WebSocket (`websocket.go`) | s0-05 |
| `encoding/` | B64, VL64 and strings | s0-06 |
| `r26/` | The R26 ids, and one file per client cast: `entry_init.go`, `navigator.go`, `room.go`… | s0-07 the framing (`packet.go`), `HELLO` and the dispatch by id (`r26.go`) and the names of hh_entry_init's commands (`entry_init.go`); s2-06 the handshake and the login (`entry_init.go`); s2-07 what the client asks after it (`entry_init.go`, `club.go`, `shared.go`); s4-03 entering and leaving a room (`room.go`); each cast's handlers with the phase that serves the cast |
| `game/` | The rules: login, entering rooms, chat, walking…, with no protocol in them | s2-05 the login and the logout; s2-07 the account, the club status and the sound setting; s4-03 entering and leaving rooms (`entering.go`); the other rules with the phases that bring them |

- `encoding` stands apart from `r26`, so that another protocol can reuse it.
- `game` never knows the protocol. It is its own package so that `r26` can call
  it without an import cycle.
- The packages around it, the state in `packages/virtual` among them: [How the server is built](/architecture.md).
