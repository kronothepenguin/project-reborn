# housekeeping — web app package

Astro (Svelte + Tailwind) frontend embedded in a Go module. The Go app struct
(`housekeeping` struct) registers a router over `packages/astro` resolvers and
serves the built frontend from the embedded `dist/`.

## Ports

- App (Go HTTP server): `housekeeping.host` and `housekeeping.port` in `config.json`,
  `localhost` and 18465 by default
- Astro dev server: **22177** — baked in `astro.config.mjs`

## Runtime

- `housekeeping.New(db, WithResolver(…), WithStatic(…))` takes the db the runner
  opened with `store.FromConfig()` and loads the settings (`virtual/settings`),
  panicking when it cannot. Only the resolver and the static handler are options.
- `Mount` registers only `/housekeeping/...`, and `/housekeeping/` for the static
  files through `http.StripPrefix`, so it runs alone on its own port and on one mux
  with the CMS. `base: "/housekeeping"` in `astro.config.mjs` gives the same prefix
  to the built pages, and the dev resolver's base URL includes it.
- There is no housekeeping login: it uses the shared session of `packages/auth`. On
  a shared mux the cookie is the CMS's, and alone it arrives because cookies do not
  depend on the port.
- Every route, the static files too, runs behind `router.Staff`:
  - a guest goes to `site.url` to sign in, because a housekeeping running alone has
    no `/`;
  - a banned user loses the session and gets 403, as on the CMS's pages;
  - a signed-in user without `housekeeping.access` gets 403.
- It works on an empty database: `store.FromConfig()` creates it, with the default
  values. Nobody can enter until someone holds `housekeeping.access`, which is what
  the installer's administrator gets.
- A task on `packages/scheduler` deletes expired sessions every minute.

## Development

Recommended: run through the app runner in `apps/housekeeping`:

```sh
cd apps/housekeeping
make dev    # astro (background) + air hot reload → http://localhost:18465/housekeeping/
make web    # astro dev server only → http://localhost:22177
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
   `go build -o apps/housekeeping/tmp/housekeeping ./apps/housekeeping/cmd/housekeeping && ./apps/housekeeping/tmp/housekeeping`

`tools/create` starts the package with a placeholder `dist/index.html`, because
`go:embed` needs a file there before the first `pnpm build`. `dist/` is ignored by
git, so on a fresh clone `make install` writes the placeholder again.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/guides/routing/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
