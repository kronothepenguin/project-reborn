# cms — web app package

The public site of the hotel: an Astro (Svelte + Tailwind) frontend embedded in a Go module. `cms.New` builds the
app, and `Mount` serves its routes and the built `dist/`.

## Ports

- App (Go HTTP server): `cms.host` and `cms.port` in `config.json`, `localhost` and 17387 by default.
- Astro dev server: 22827, baked in `astro.config.mjs`.

## Setup

```sh
make install    # once: Go modules, pnpm dependencies and a placeholder dist/index.html
```

## Development

Run it through the app runner in `apps/cms`:

```sh
cd apps/cms
make dev        # Astro dev server + air hot reload → http://localhost:17387
```

Or run the Astro dev server alone from this directory:

```sh
pnpm astro dev --background    # → http://localhost:22827
pnpm astro dev stop            # also: status, logs
```

## Production build

From the repository root:

```sh
pnpm --dir packages/cms build
go build -o apps/cms/tmp/cms ./apps/cms/cmd/cms && ./apps/cms/tmp/cms
```

## Tests

```sh
go test ./...
```

How it works: `knowledge/index.md`.
