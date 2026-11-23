# server — Go package

The game server. It speaks the protocol of the R26 client. `New(db, opts...)`
loads the shared data once no database update waits, and reads each setting
from the store when it uses it. `Start` and `Stop` open and close the WebSocket
listeners of the client's two connections, the game's doors.

`apps/server` runs it alone, with `WithAPI()`: the game then serves its `/api/`
on `server.api`, which the CMS and housekeeping call. `packages/reborn` runs it
in one process with the other programs, with no `/api/`.

How it works: `knowledge/index.md`.

## Ports

- `info` and `mus` (WebSocket listeners): **30000** and **30001** by default,
  the ports of `server.info` and `server.mus` in `config.json`
- The `/api/` (HTTP), with `WithAPI()` only: **15445** by default, `server.api`
  in `config.json`

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
