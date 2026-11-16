# reborn — app runner

The runner of `packages/reborn`: the whole hotel in one process. `cmd/reborn` serves the embedded builds of the CMS,
housekeeping and the installer.

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

## Production

From the repository root, in the folder of an installed hotel:

```sh
make frontends
make build
./bin/reborn   # → http://localhost:16416, reads ./config.json
```
