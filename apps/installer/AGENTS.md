# installer — app runner

Thin runner for `packages/installer`. The app code (Go struct + Astro frontend)
lives entirely in the package; this module only serves it.

| cmd             | mode        | resolver / static                     |
| --------------- | ----------- | ------------------------------------- |
| `./cmd/installer`     | production | `astro.MakeFSResolver` (embedded dist) + `http.FileServerFS` |
| `./cmd/installer-dev` | development | `astro.MakeServerResolver` + reverse proxy to the astro dev server |

## Ports

- App (Go HTTP server): **17306** — baked in both runners
- Astro dev server: **25050** — baked in `packages/installer/astro.config.mjs`

## Run

```sh
make install    # once, at repo root — wires go workspace + pnpm + tools
make dev        # astro (background) + air hot reload → http://localhost:17306
make web        # astro dev server only → http://localhost:25050
make stop       # stop the background astro server
```

## Production

```sh
cd ../../packages/installer
pnpm build
cd ../../apps/installer
go build -o ./tmp/installer ./cmd/installer
./tmp/installer   # → http://localhost:17306
```

## Runner notes

- Both runners wrap the mux in `http.NewCrossOriginProtection` and exit with
  the error when the server cannot start.
- The installer writes `config.json` in the working directory; see
  `packages/installer/AGENTS.md`.

## Dev-mode notes

- Air watches `packages/astro` and `packages/installer` (`.go` only) and
  rebuilds the dev runner on Go changes.
- Astro page edits are hot-reloaded by the astro dev server; the runner
  re-fetches pages on every request, so no Go restart is needed for
  frontend-only changes.