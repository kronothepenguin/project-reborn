# server — app runner

Thin runner for `packages/server`. The app code (a Go struct, without a
frontend) lives entirely in the package; this module only serves it.

| cmd               | mode                       |
| ----------------- | -------------------------- |
| `./cmd/server` | production and development |

## Port

- App (Go HTTP server): **15445** — baked in the runner
- `info` and `mus` (WebSocket listeners): the hosts and ports of `server.info`
  and `server.mus` in `config.json`, 30000 and 30001 by default, which the
  runner starts with `StartInfo` and `StartMus`

## Run

```sh
make install    # once: this project's folders and dependencies
make dev        # air hot reload → http://localhost:15445
```

## Production

```sh
cd ../..
go build -o ./apps/server/tmp/server ./apps/server/cmd/server
./apps/server/tmp/server   # → http://localhost:15445, reads ./config.json
```

## Dev-mode notes

- `make dev` starts air from the repository root, so the runner reads and
  writes the root `config.json`.
- Air watches the `.go` files of `apps/server`, `packages/server` and the
  packages it imports (`config`, `store`), and rebuilds the runner on Go changes.
- The runner opens the database with `store.FromConfig()`, which creates it when
  it does not exist.
