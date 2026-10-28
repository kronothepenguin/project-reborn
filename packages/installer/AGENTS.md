# installer — web app package

The installer writes `config.json` in its working directory, creates the
database the file names, saves the site settings and creates the first
administrator. It is an Astro (Svelte + Tailwind) frontend embedded in a Go
module: the `Installer` struct registers the routes over `packages/astro`
resolvers and serves the built frontend from the embedded `dist/`.

## Steps

| Route | Page | Does |
| --- | --- | --- |
| `GET /{$}` | `index.astro` | Shows the state; says the hotel is installed once an administrator exists |
| `GET`, `POST /config` | `config.astro` | Database path and hotel port: opens the database (creating it and its schema), then writes `config.json` with `config.Create` |
| `GET`, `POST /site` | `site.astro` | Site name, short name, URL, start credits and secure cookies, saved with `virtual.Settings.Set` and no user |
| `GET`, `POST /admin` | `admin.astro` | Habbo name, email, birth date and password: one transaction creates the user, habbo, profile, home, wallet (5000 credits) and the Administrators group with every attribute |
| `GET /done` | `done.astro` | Shows where `config.json` and the database are |

- Once a user holds `housekeeping.accessGroups`, every step redirects to the
  status page.
- `/site` and `/admin` redirect to `/config` until `config.json` exists.
- A restarted installer continues: `New` opens the database named by an
  existing `config.json` (`internal/setup`).
- The runners wrap the mux in `http.NewCrossOriginProtection`, so a page on
  another site cannot post the forms to the installer.

## Working directory

`config.json`, and the database when its path is relative, land in the
directory the installer runs from, and the hotel reads them from its own.
`make dev` runs every runner from the repository root, so they share the root
`config.json` and database, both gitignored.

## Ports

- App (Go HTTP server): **17306** — baked in `apps/installer/cmd/installer`
  and `apps/installer/cmd/installer-dev`
- Astro dev server: **25050** — baked in `astro.config.mjs`

## Development

Recommended: run through the app runner in `apps/installer`:

```sh
cd apps/installer
make dev    # astro (background) + air hot reload → http://localhost:17306
make web    # astro dev server only → http://localhost:25050
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
   `go build -o apps/installer/tmp/installer ./apps/installer/cmd/installer && ./apps/installer/tmp/installer`

The placeholder in `dist/index.html` exists so the package compiles before the
first `pnpm build`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/guides/routing/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)