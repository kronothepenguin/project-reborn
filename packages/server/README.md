# server — Go package

A Go module without a frontend. The app struct (`Server` struct) takes the
database in `New(db)` and registers its routes on a mux in `Mount(mux)`;
`apps/server` runs it.

## Layout

The game server is laid out as `plans/server/decisions/0005-package-layout.md`
decides. Each part is marked with the task of `plans/server/tasks/index.md`
that brings it. For now the package is what `tools/create` generated:
`server.go`, and `internal/router`, whose `GET /` answers `Hello from Go`.

| Part | Holds | Brought by |
| --- | --- | --- |
| `server.go` | `New(db)`, serving TCP, and `Mount(mux)` for the WebSocket | s0-03 generated `New(db)` and `Mount(mux)`; s0-07 serves the TCP listeners and mounts the WebSocket paths |
| `transport/` | `Conn`, an `io.Reader` to receive, an `io.Writer` to send and an `io.Closer`, over TCP (`tcp.go`) and the WebSocket (`websocket.go`) | s0-05 |
| `encoding/` | B64, VL64 and strings | s0-06 |
| `r26/` | The R26 ids, and one file per client cast: `entry_init.go`, `navigator.go`, `room.go`… | s0-07 the framing, `HELLO` and the dispatch by id; each cast's handlers with the phase that serves the cast, from S2 |
| `game/` | The rules: login, entering rooms, chat, walking…, with no protocol in them | S2, the first rules; its tasks are written when the phase starts |

- `encoding` stands apart from `r26`, so that another protocol can reuse it.
- `game` never knows the protocol. It is its own package so that `r26` can call
  it without an import cycle.
- The server's state lives in `packages/virtual`, which holds only state.

## Port

- App (Go HTTP server): **15445** — baked in `apps/server/cmd/server`

## Development

Run it through the app runner in `apps/server`:

```sh
cd apps/server
make dev    # air hot reload → http://localhost:15445
```

## Production build

From the repository root:
`go build -o apps/server/tmp/server ./apps/server/cmd/server && ./apps/server/tmp/server`
