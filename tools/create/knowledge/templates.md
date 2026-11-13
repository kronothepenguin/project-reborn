---
type: Reference
title: Templates
description: The three kinds of project tools/create makes, the folders each one writes and what it runs after.
resource: tools/create/cmd/create/templates
---

# Usage

Run it from the repository root, which it takes as the working directory:

```sh
make create name=<name> [template=fullstack|backend|client] [app-port=N] [astro-port=N] [dry-run=1]
```

`make create` builds the tools first and calls `tools/create/bin/create`. `dry-run` prints what it would create.

# Kinds

Each kind is a folder of `cmd/create/templates/` (decision server/0003). `[[name]]` in a path becomes the name.

| Template | Creates |
| --- | --- |
| `fullstack`, the default | `packages/<name>`: the Go package with its Astro, Svelte and Tailwind frontend. `apps/<name>`: the runner, the `-dev` runner that proxies Astro, `.air.toml` and the `Makefile` |
| `backend` | `packages/<name>`: the Go package only. `apps/<name>`: the runner, `.air.toml` and the `Makefile` |
| `client` | `packages/<name>` only: a plain Vite app with `package.json`, `vite.config.js`, `index.html` and `src/main.js` (decision server/0018) |

- The fullstack and backend runners serve the package on an HTTP server of their own. The backend template keeps it as
  a generic starter; a package that needs no HTTP server deletes it (decision reborn/0014).
- `.air.toml` paths are relative to the repository root, and `make dev` starts air from there
  (decision holo-port/0027).
- The fullstack package starts with a placeholder `dist/index.html`, because `go:embed` needs a file there before the
  first `pnpm build`. Its `make install` writes it again on a fresh clone.
- Templates are Go `text/template` files with the data `Name`, `Package`, `Type`, `AppPort`, `AstroPort` and
  `VitePort`. The `.go` output goes through `gofmt`.

# After writing

- A client: `pnpm --filter @project-reborn/<name>... install`.
- A Go project: `go work use` for both folders, `go work sync`, `go mod tidy -e` in both, then `make install` in
  `apps/<name>`.
- On a failed write, it removes the folders it made.
- It prints the files, the ports and what to run next.
