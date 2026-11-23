# server — app runner

Thin runner for `packages/server`, the game server. The app code lives entirely
in the package; this module only serves it.

`apps/reborn` runs the whole hotel, the game included. Run the game alone to work on it, or to test how the
programs talk to it.

How it works: `packages/server/knowledge/index.md` and `knowledge/programs.md`.

| cmd            | mode                       |
| -------------- | -------------------------- |
| `./cmd/server` | production and development |

## Ports

- `info` and `mus` (WebSocket listeners): the hosts and ports of `server.info`
  and `server.mus` in `config.json`, 30000 and 30001 by default, which the
  runner opens with `Start`
- The game's `/api/` (HTTP): `server.api` in `config.json`, `localhost:15445` by
  default. The CMS and housekeeping, run alone, call it with the hotel's secret.

## Stop

Ctrl-C or SIGTERM calls `Stop`: each player is logged out with its last time
online saved and the doors close, then the database closes.

## Run

```sh
make install    # once: this project's folders and dependencies
make dev        # air hot reload → ws://localhost:30000 and ws://localhost:30001
make check      # checks the formatting, vets and builds the runner
```

## Production

```sh
cd ../..
go build -o ./apps/server/tmp/server ./apps/server/cmd/server
./apps/server/tmp/server   # → ws://localhost:30000 and ws://localhost:30001, reads ./config.json
```
