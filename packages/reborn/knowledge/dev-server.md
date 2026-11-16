---
type: Astro Project
title: Dev server
description: The dev-only Astro project that serves the CMS's, housekeeping's and the installer's pages from one dev server, under /, /housekeeping/ and /installer/.
resource: packages/reborn/astro.config.mjs
---

# Dev server

`packages/reborn` holds, beside its Go code, an Astro project that is never built
(`knowledge/decisions/reborn/0009-one-dev-server-for-reborn.md`). It serves every page of the three sites from one dev
server, so that a dev runner proxies one server for all of them.

```sh
pnpm --filter @project-reborn/reborn dev   # http://localhost:16417
```

# What it serves

| Site | Pages | Under | Public files |
| --- | --- | --- | --- |
| CMS | `packages/cms/src/pages` | `/` | `packages/cms/public`, the project's `publicDir` |
| Housekeeping | `packages/housekeeping/src/pages` | `/housekeeping/` | `packages/housekeeping/public`, by a middleware |
| Installer | `packages/installer/src/pages` | `/installer/` | `packages/installer/public`, by a middleware |

- The integration `reborn-site-pages` calls `injectRoute` once per `.astro` file: `news/id.astro` of housekeeping
  becomes `/housekeeping/news/id`, an `index.astro` becomes its folder.
- The plugin `reborn-site-public` serves a site's `public/` under its base with `sirv`, as the site's own dev server
  does.
- `vite.server.fs.allow` holds the repository root, so Vite serves the sites' files and `node_modules`.
- Each page keeps its site's stylesheet, Svelte islands and shared components. Tailwind scans each site's own folder
  through `source("../..")` in the site's `global.css`.
- An edit to a page's `.astro` file reloads the page in the browser.

# For a Go runner

- `astro.MakeServerResolver` takes the site's base address: `http://localhost:16417/` for the CMS,
  `http://localhost:16417/housekeeping/` and `http://localhost:16417/installer/`. It answers with the parsed page,
  also for a missing page, whose 404 body it parses as the template.
- One `httputil.NewSingleHostReverseProxy` of `http://localhost:16417/` serves every site's static files and Vite's
  own paths (`/@vite/client`, `/@fs/...`): requests keep their `/housekeeping/` or `/installer/` prefix. A proxy whose
  base address has a path, such as `/installer/`, prefixes it again and gets 404.
