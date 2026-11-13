---
type: Reference
title: Runners
description: The two runners of apps/cms, how each serves the frontend, and how the development runner reloads.
---

# Runners

`apps/cms` holds only the runners; the app is this package.

| cmd | Mode | Resolver and static files |
| --- | --- | --- |
| `apps/cms/cmd/cms` | production | `astro.MakeFSResolver` over the embedded `dist/`, and `http.FileServerFS` |
| `apps/cms/cmd/cms-dev` | development | `astro.MakeServerResolver`, and a reverse proxy to the Astro dev server on 22827 |

# Development

- `make dev` in `apps/cms` starts air and the Astro dev server together.
- Air watches the `.go` files of `apps/cms`, `packages/astro`, `packages/auth`, `packages/cms`, `packages/config`,
  `packages/scheduler`, `packages/store` and `packages/virtual` (`apps/cms/.air.toml`), and rebuilds the dev runner on
  Go changes.
- Astro page edits are hot-reloaded by the Astro dev server. The dev runner fetches the rendered page fresh on every
  request, so frontend changes need no Go restart.
- `go:embed` needs a file in `dist/` before the first `pnpm build`, so `make install` writes a placeholder
  `dist/index.html`.
