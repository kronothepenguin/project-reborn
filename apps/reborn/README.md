# reborn — app runner

The runner of `packages/reborn`: the whole hotel in one process. `cmd/reborn` opens the database, builds the CMS,
housekeeping, the installer and the game with their embedded builds, and hands them to `reborn.New`.

How it works: `packages/reborn/knowledge/index.md` and `knowledge/programs.md`.

## Ports

- The site and housekeeping: `reborn.host` and `reborn.port` in `config.json`, `localhost` and 16416 by default.
  Housekeeping is at `/housekeeping/`.
- The game (WebSocket listeners): `server.info` and `server.mus`, 30000 and 30001 by default.

## Run

```sh
make install    # once: the projects' folders and dependencies
make check      # checks the formatting, vets and builds the runner
```

## Development

From the repository root:

```sh
make frontends  # once: the programs embed their builds, so the runners need them to compile
make dev        # → http://localhost:16416, reads the root config.json
```

`make dev` runs `cmd/reborn-dev` under air and the Astro dev server of `packages/reborn` on 22448. `reborn-dev` builds
the programs as `cmd/reborn` does, with each site's pages and static files from the dev server: the CMS at `/`,
housekeeping at `/housekeeping/` and the installer at `/installer/`. An edit to a page reloads it in the browser; an edit
to the Go code rebuilds and restarts the runner.

Run by an AI agent, Astro starts its dev server in the background: `make -C apps/reborn stop` stops it.

Before the administrator exists, reborn sends every path outside `/installer/` to the installer, Vite's own paths
included: the installer's pages render with their styles, and reload by hand.

## Production

From the repository root:

```sh
make frontends
make build
./bin/reborn   # → http://localhost:16416, reads ./config.json
```

In an empty folder, reborn writes `config.json`, creates the database and serves the installer at
`http://localhost:16416/installer/`. Once the administrator exists, the hotel runs there without a restart.
