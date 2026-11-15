# housekeeping — web app package

The staff panel of Project Reborn: an Astro (Svelte + Tailwind) frontend embedded in a Go module, served under
`/housekeeping`.

How it works: `knowledge/index.md`.

## Ports

- App (Go HTTP server): `housekeeping.host` and `housekeeping.port` in `config.json`, `localhost` and 18465 by default
- Astro dev server: **22177**, baked in `astro.config.mjs`

## Development

Recommended: run through the app runner in `apps/housekeeping`:

```sh
cd apps/housekeeping
make dev    # astro (background) + air hot reload → http://localhost:18465/housekeeping/
make web    # astro dev server only → http://localhost:22177
make stop   # stop the background astro server
```

Or run the astro dev server from this directory:

```sh
pnpm astro dev --background
pnpm astro dev stop    # also: status, logs
```

## Test

```sh
make check                                            # from this directory: builds the pages, then the Go checks
cd tests/e2e && pnpm test housekeeping-settings       # a browser suite, from the repository root
```

## Production build

1. `pnpm build` renders `dist/`.
2. From the repository root:
   `go build -o apps/housekeeping/tmp/housekeeping ./apps/housekeeping/cmd/housekeeping && ./apps/housekeeping/tmp/housekeeping`

`make install` writes a placeholder `dist/index.html`, because `go:embed` needs a file there before the first
`pnpm build`.
