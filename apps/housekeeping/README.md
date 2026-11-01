# housekeeping — app runner

Thin runner for `packages/housekeeping`. The app code (Go struct + Astro frontend)
lives entirely in the package; this module only serves it.

| cmd             | mode        | resolver / static                     |
| --------------- | ----------- | ------------------------------------- |
| `./cmd/housekeeping`     | production | `astro.MakeFSResolver` (embedded dist) + `http.FileServerFS` |
| `./cmd/housekeeping-dev` | development | `astro.MakeServerResolver` + reverse proxy to the astro dev server |

## Ports

- App (Go HTTP server): `housekeeping.host` and `housekeeping.port` in `config.json`,
  `localhost` and 18465 by default, read by both runners. A pod sets
  `housekeeping.host` to `0.0.0.0`.
- Astro dev server: **22177** — baked in `packages/housekeeping/astro.config.mjs`

## Run

```sh
make install    # once: this project's folders and dependencies
make dev        # astro (background) + air hot reload → http://localhost:18465/housekeeping/
make web        # astro dev server only → http://localhost:22177
make stop       # stop the background astro server
```

## Production

```sh
cd ../../packages/housekeeping
pnpm build
cd ../..
go build -o ./apps/housekeeping/tmp/housekeeping ./apps/housekeeping/cmd/housekeeping
./apps/housekeeping/tmp/housekeeping   # → http://localhost:18465/housekeeping/, reads ./config.json
```

## Dev-mode notes

- `make dev` starts air from the repository root, so the runner reads and
  writes the root `config.json`.
- Air watches the `.go` files of `apps/housekeeping`, `packages/astro`,
  `packages/housekeeping` and the packages it imports (`auth`, `config`, `scheduler`,
  `store`, `virtual`), and rebuilds the dev runner on Go changes.
- The runners open the database with `store.FromConfig()`, which creates it when
  it does not exist.
- Astro page edits are hot-reloaded by the astro dev server; the runner
  re-fetches pages on every request, so no Go restart is needed for
  frontend-only changes.
