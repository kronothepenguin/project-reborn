---
type: Reference
title: Layout
description: The files and folders of packages/server and what each holds.
tags: [server]
---

The game server is laid out as `knowledge/decisions/server/0005-package-layout.md`
decides. The package holds `server.go`, which `tools/create`
generated, the listeners of `server.go` and `mus.go`, and under `internal/`, which only this module imports, `internal/transport/`,
`internal/encoding/`, `internal/r26/`, `internal/game/` and `internal/router/`, the handlers of the `/api/`. `api/` is
the client of the `/api/` for the programs run apart.

| Part | Holds |
| --- | --- |
| `server.go` | `SendLook(ctx, avatarID)`, which satisfies `services.Habbos` and calls `game.SendLook`; `New(db, opts...)`, which loads the settings and reloads them (`knowledge/decisions/server/0050-the-server-loads-and-reloads-the-settings.md`) and opens the `/api/` listener with `WithAPI()`, and `StartInfo` and `StartMus`, which start a WebSocket listener on the host and port of `server.info` and of `server.mus` (`knowledge/decisions/server/0020-info-and-mus-websocket-ports.md`, `knowledge/decisions/server/0022-start-info-and-start-mus.md`) |
| `mus.go` | What the `mus` listener does until S7 frames MUS: it logs and never answers (`knowledge/decisions/server/0023-mus-listener-before-s7.md`) |
| `internal/transport/` | `Conn`, an `io.Reader` to receive, an `io.Writer` to send and an `io.Closer`, over TCP (`tcp.go`) and the WebSocket (`websocket.go`) |
| `internal/encoding/` | B64, VL64 and strings |
| `internal/r26/` | The R26 ids, and one file per client cast: `entry_init.go`, `navigator.go`, `room.go`… |
| `api/` | `api.New(baseURL, db)`, the client of the `/api/`, which implements `services.Habbos` |
| `internal/router/` | The `/api/` handlers, one file per route (`habbos_look.go`), and the check of `X-Reborn-Secret` |
| `internal/game/` | The rules: login, entering rooms, chat, walking…, with no protocol in them |

- `encoding` stands apart from `r26`, so that another protocol can reuse it.
- `game` never knows the protocol. It is its own package so that `r26` can call
  it without an import cycle.
- The packages around it, the state in `packages/virtual` among them: [How the server is built](/architecture.md).
