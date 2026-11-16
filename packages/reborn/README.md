# reborn

Runs the whole hotel in one process: the site and housekeeping on one mux, and the game server's two listeners, on one
database handle. `apps/reborn` is its runner: it builds each program and hands them to `reborn.New`.

How it works: `knowledge/index.md`.

Check, from `packages/reborn`, after `make install` in `apps/reborn`, which gives the frontends their `dist/`:

```sh
make check
```
