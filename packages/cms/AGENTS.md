# cms — web app package

Astro (Svelte + Tailwind) frontend embedded in a Go module. The Go app struct
(`cms` struct) registers a router over `packages/astro` resolvers and
serves the built frontend from the embedded `dist/`.

## Ports

- App (Go HTTP server): **17387** — baked in `apps/cms/cmd/cms`
  and `apps/cms/cmd/cms-dev`
- Astro dev server: **22827** — baked in `astro.config.mjs`

## Development

Recommended: run through the app runner in `apps/cms`:

```sh
cd apps/cms
make dev    # astro (background) + air hot reload → http://localhost:17387
make web    # astro dev server only → http://localhost:22827
make stop   # stop the background astro server
```

Or run the astro dev server directly from this directory:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and
`astro dev logs`. Astro page edits are hot-reloaded; the Go router fetches
the rendered page fresh on every request in dev mode.

## Production build

1. `pnpm build` — renders `dist/`
2. From the repository root:
   `go build -o apps/cms/tmp/cms ./apps/cms/cmd/cms && ./apps/cms/tmp/cms`

The placeholder in `dist/index.html` exists so the package compiles before the
first `pnpm build`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/guides/routing/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)