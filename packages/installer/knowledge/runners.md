---
type: Reference
title: Runners
description: How apps/installer serves the installer, where config.json lands, and what its dev runner watches.
---

# Runners

`apps/installer` is a thin runner: the app code lives in `packages/installer`.

| cmd | mode | resolver / static |
| --- | --- | --- |
| `./cmd/installer` | production | `astro.MakeFSResolver` (embedded dist) + `http.FileServerFS` |
| `./cmd/installer-dev` | development | `astro.MakeServerResolver` + reverse proxy to the astro dev server |

- Both runners listen on `localhost:17306`, a fixed address, because the installer runs before `config.json` exists
  (decision holo-port/0037). The installer answers at `/installer/`.
- `Mount` wraps its own routes in `http.NewCrossOriginProtection`, so a page on another site cannot post the forms,
  such as the administrator form, to the installer on localhost.
- The runners pass no `Listener`, so the installer shows the form for programs run apart.
- Both runners exit with the error when the server cannot start.

# Working directory

`config.json`, and the database when its path is relative, land in the directory the installer runs from, and the hotel
reads them from its own. `make dev` runs every runner from the repository root, so they share the root `config.json`
and database, both gitignored (decision holo-port/0027).

# Dev mode

- Air watches the `.go` files of `apps/installer`, `packages/astro`, `packages/installer` and the packages the
  installer imports (`auth`, `config`, `store`, `virtual`), and rebuilds the dev runner on Go changes.
- `exclude_dir` lists `packages/installer/node_modules` and `packages/installer/dist`: air matches excluded paths
  exactly from the root, and would otherwise walk `node_modules`.
- Astro page edits are hot-reloaded by the astro dev server. The runner fetches the rendered page on every request, so
  frontend-only changes need no Go restart.
- `make install` writes a placeholder `dist/index.html`, because `go:embed` needs a file there before the first
  `pnpm build`.
