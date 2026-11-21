# reborn — app runner

The runner of `packages/reborn`: the whole hotel in one process. `cmd/reborn` opens the database, hands it to
`reborn.New` with the pages and files of reborn's embedded `dist`, and owns the HTTP server.

How it works: `packages/reborn/knowledge/index.md` and `knowledge/programs.md`.

## Flow

`cmd/reborn` and `cmd/reborn-dev` run the same flow (`knowledge/decisions/reborn/0015-the-runner-owns-reborns-http-server.md`):

1. A hotel that is not installed: `MountInstaller` on a mux, `Serve` it, and `WaitForInstall`. A Ctrl-C before the
   administrator exists shuts the server down and ends the program.
2. `Mount` on a new mux, and `Serve` it: the site's server takes the open listener over, then the installer's shuts
   down. `Start` opens the game's doors; its error ends the program.
3. Ctrl-C or SIGTERM: the open requests finish, for up to ten seconds; `Stop` logs each player out with its last time
   online saved; the database closes.

`internal/web` is the HTTP server:

- `New(host, port)`, and `Serve(h)`: the first call opens `host:port`. One accept loop hands each connection to the
  current `http.Server`, so a later `Serve` starts a server for its handler on the open listener first, then retires
  the old one: it takes no new connection, answers the next request of each of its connections with `Connection:
  close`, closes an idle one after two minutes, and closes once none is left. No request finds the address closed, and
  every new connection gets the new handler.
- `Move(w, r, host, port)` is the installer's `Listener`: it opens the new address, redirects the browser with 303 to
  the same path there, closes the old listener and retires the old server. With host `0.0.0.0` or `::` the
  browser keeps its host name. On `EADDRINUSE` with the same port, as `0.0.0.0` over `localhost`, the old listener lets
  go first; when the new address still fails, the old one opens again. A failed move leaves the browser on the form
  with the error.
- `Shutdown(ctx)` closes the listener and shuts every server down, the retired ones too: the open requests finish
  until `ctx` ends.
- A failed accept is logged and retried after a pause.

## Ports

- The site and housekeeping: `reborn.host` and `reborn.port` in `config.json`, `localhost` and 16416 by default.
  Housekeeping is at `/housekeeping/`.
- The game (WebSocket listeners): `server.info` and `server.mus`, 30000 and 30001 by default.

## Run

```sh
make install    # once: the projects' folders and dependencies
make check      # checks the formatting, vets, tests and builds the runner
```

## Development

From the repository root:

```sh
make frontends  # once: the programs embed their builds, so the runners need them to compile
make dev        # → http://localhost:16416, reads the root config.json
```

`make dev` runs `cmd/reborn-dev` under air and the Astro dev server of `packages/reborn` on 22448. `reborn-dev` runs
the flow of `cmd/reborn` with the pages and files of the dev server: the CMS at `/`, housekeeping at `/housekeeping/`
and the installer at `/installer/`. An edit to a page reloads it in the browser; an edit
to the Go code rebuilds and restarts the runner.

Run by an AI agent, Astro starts its dev server in the background: `make -C apps/reborn stop` stops it.

Before the administrator exists, reborn sends every page outside `/installer/` to the installer and serves the files,
Vite's own paths included: the installer's pages render with their styles.

## Production

From the repository root:

```sh
make frontends
make build
./bin/reborn   # → http://localhost:16416, reads ./config.json
```

In an empty folder, reborn writes `config.json`, creates the database and serves the installer at
`http://localhost:16416/installer/`. Once the administrator exists, the hotel runs there without a restart.
