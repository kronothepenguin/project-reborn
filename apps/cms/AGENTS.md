# cms — app runner

Thin runner for `packages/cms`. The app code (Go struct + Astro frontend)
lives entirely in the package; this module only serves it.

| cmd             | mode        | resolver / static                     |
| --------------- | ----------- | ------------------------------------- |
| `./cmd/cms`     | production | `astro.MakeFSResolver` (embedded dist) + `http.FileServerFS` |
| `./cmd/cms-dev` | development | `astro.MakeServerResolver` + reverse proxy to the astro dev server |

## Ports

- App (Go HTTP server): `cms.host` and `cms.port` in `config.json`, `localhost`
  and 17387 by default, read by both runners. A pod sets `cms.host` to `0.0.0.0`.
- Astro dev server: **22827** — baked in `packages/cms/astro.config.mjs`

## Run

```sh
make install    # once, at repo root — wires go workspace + pnpm + tools
make dev        # astro (background) + air hot reload → http://localhost:17387
make web        # astro dev server only → http://localhost:22827
make stop       # stop the background astro server
```

## Production

```sh
cd ../../packages/cms
pnpm build
cd ../..
go build -o ./apps/cms/tmp/cms ./apps/cms/cmd/cms
./apps/cms/tmp/cms   # → http://localhost:17387, reads ./config.json
```

## Dev-mode notes

- `make dev` starts air from the repository root, so the runner reads and
  writes the root `config.json`.
- Air watches the `.go` files of `apps/cms`, `packages/astro`, `packages/cms`
  and the packages the CMS imports (`auth`, `config`, `store`, `virtual`),
  and rebuilds the dev runner on Go changes.
- Run the installer first: the runners open the database with
  `store.FromConfig()`, and `config.Get` writes a default `config.json` when it
  is missing.
- Astro page edits are hot-reloaded by the astro dev server; the runner
  re-fetches pages on every request, so no Go restart is needed for
  frontend-only changes.