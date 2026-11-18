# server — Go package

The game server. It speaks the protocol of the R26 client: `New(db)` loads the
settings and the shared data, and `Start` and `Stop` open and close the
WebSocket listeners of the client's two connections, the game's doors. `apps/server` runs it.
It serves no HTTP of its own.

How it works: `knowledge/index.md`.

## Port

- `info` and `mus` (WebSocket listeners): **30000** and **30001** by default,
  the ports of `server.info` and `server.mus` in `config.json`

## Development

Run it through the app runner in `apps/server`:

```sh
cd apps/server
make dev    # air hot reload → ws://localhost:30000 and ws://localhost:30001
```

## Production build

From the repository root:
`go build -o apps/server/tmp/server ./apps/server/cmd/server && ./apps/server/tmp/server`

## Tests

```sh
cd packages/server
go test ./...
```
