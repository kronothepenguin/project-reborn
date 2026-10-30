# cms — web app package

Astro (Svelte + Tailwind) frontend embedded in a Go module. The Go app struct
(`cms` struct) registers a router over `packages/astro` resolvers and
serves the built frontend from the embedded `dist/`.

## Ports

- App (Go HTTP server): `cms.port` in `config.json`, 17387 by default
- Astro dev server: **22827** — baked in `astro.config.mjs`

## Runtime

- `cms.New(db, WithResolver(…), WithStatic(…))` takes the db the runner opened
  with `store.FromConfig()` and loads the settings (`virtual/settings`),
  panicking when it cannot. Only the resolver and the static handler are
  options, because they differ between the production and development runners.
- `Mount` wraps every CMS route with `auth.RealIP`, cross-origin protection and
  `auth.Sessions`, so the CMS stays protected on a mux it shares with other apps.
- While `site.maintenance` is on, every page route serves
  `maintenance.html` with 503, except `POST /` (sign in), `POST /logout` and the
  static files; users holding `site.maintenanceBypass` see the site. A failed
  sign-in stays on the maintenance page.
- Signing in lands on `/me`, and `/` sends signed-in visitors there.
- A form that fails answers 422 with the page it came from.
- Page structs on the `signed-out` layout embed `hotelStatus`, because the layout
  reads `.Online` and `.OnlineCount` and rendering fails without them.
- Nothing reloads the settings for now.

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