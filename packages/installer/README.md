# installer — web app package

The installer writes `config.json`, creates the database, saves the site settings, imports the client files when
chosen and creates the first administrator.
It is an Astro (Svelte + Tailwind) frontend embedded in a Go module.

`packages/reborn` mounts it under `/installer/` until the administrator exists: there it asks one host and port and
moves the hotel to them. `apps/installer` runs it alone, for programs run apart.

## Ports

- App (Go HTTP server): **17306**, in `apps/installer/cmd/installer` and `apps/installer/cmd/installer-dev`
- Astro dev server: **25050**, in `astro.config.mjs`

## Development

```sh
make install                     # once: dependencies and a placeholder dist/index.html
cd ../../apps/installer
make dev                         # astro (background) + air hot reload → http://localhost:17306/installer/
make web                         # astro dev server only → http://localhost:25050
make stop                        # stop the background astro server
```

## Build and test

```sh
pnpm build                       # renders dist/
make check                       # builds the pages, then checks the formatting, vets, tests and builds the Go code
```

From the repository root:
`go build -o apps/installer/tmp/installer ./apps/installer/cmd/installer && ./apps/installer/tmp/installer`

Astro documentation: https://docs.astro.build

How it works: `knowledge/index.md`.
