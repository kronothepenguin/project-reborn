# housekeeping — app runner

Thin runner for `packages/housekeeping`: `./cmd/housekeeping` for production and `./cmd/housekeeping-dev` for
development.

`apps/reborn` runs the whole hotel, housekeeping included. Run housekeeping alone to work on it, or to test how it
talks to the game. Run alone, it tells the game of a change, and opens and closes its doors, through the game's
`/api/` on `server.api`, `localhost:15445` by default.

How it works: `packages/housekeeping/knowledge/index.md` and `knowledge/programs.md`.

## Ports

- App (Go HTTP server): `housekeeping.host` and `housekeeping.port` in `config.json`, `localhost` and 18465 by default,
  read by both runners. A pod sets `housekeeping.host` to `0.0.0.0`.
- Astro dev server: **22177**, baked in `packages/housekeeping/astro.config.mjs`

## Run

```sh
make install    # once: this project's folders and dependencies
make dev        # astro (background) + air hot reload → http://localhost:18465/housekeeping/
make web        # astro dev server only → http://localhost:22177
make stop       # stop the background astro server
make check      # checks the formatting, vets and builds the runner
```

## Production

```sh
cd ../../packages/housekeeping
pnpm build
cd ../..
go build -o ./apps/housekeeping/tmp/housekeeping ./apps/housekeeping/cmd/housekeeping
./apps/housekeeping/tmp/housekeeping   # → http://localhost:18465/housekeeping/, reads ./config.json
```
