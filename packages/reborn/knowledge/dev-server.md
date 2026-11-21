---
type: Astro Project
title: Dev server
description: The Astro project that serves the CMS's, housekeeping's and the installer's pages from one dev server, under /, /housekeeping/ and /installer/, and builds them into one dist.
resource: packages/reborn/astro.config.mjs
---

# Dev server

`packages/reborn` holds, beside its Go code, an Astro project
(`knowledge/decisions/reborn/0009-one-dev-server-for-reborn.md`). It serves every page of the three sites from one dev
server, so that a dev runner proxies one server for all of them, and builds them into one `dist`.

```sh
pnpm --filter @project-reborn/reborn dev     # http://localhost:22448
pnpm --filter @project-reborn/reborn build   # packages/reborn/dist
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
- `@project-reborn/components` is a dependency of the project: the build resolves the Svelte islands of the shared
  components from it.

# What it builds

- `dist/` holds the CMS's pages and `public/` at its root, housekeeping's under `dist/housekeeping/` and the
  installer's under `dist/installer/`.
- The integration `reborn-site-public-build` copies housekeeping's and the installer's `public/` under their base, and
  moves `housekeeping.html` and `installer.html`, where Astro writes the route of a base, to `index.html` under it.
- Every site's scripts and stylesheets are under `dist/_astro/`, shared: an installer page loads its stylesheet from
  `/_astro/`.

# For a Go runner

`apps/reborn/cmd/reborn-dev` serves each site from the dev server under the site's base address:
`http://localhost:22448/` for the CMS, `http://localhost:22448/housekeeping` and `http://localhost:22448/installer`.
The root address ends in `/`, so `JoinPath` keeps the leading slash.

- `astro.MakeServerResolver` of the base address resolves the site's pages. It answers with the parsed page, also for a
  missing page, whose 404 body it parses as the template.
- `httputil.NewSingleHostReverseProxy` of the base address serves the site's static files. Housekeeping and the
  installer mount their static handler behind `http.StripPrefix`, so `/housekeeping/favicon.svg` reaches the proxy as
  `/favicon.svg` and the proxy puts the base path back. A proxy of the root would answer with the CMS's
  `favicon.svg`.
- Vite's own paths (`/@vite/client`, `/@fs/...`, `/@id/...`) are at the root: the CMS's proxy serves them.
- The page's HMR WebSocket at `ws://localhost:16416/` meets the CMS's own `/` route, and Vite's client falls back to a
  direct connection to the dev server. Live reload works through that fallback.
- Before the administrator exists, reborn redirects the programs' routes to the installer and serves what falls to the
  static handlers, Vite's paths included: the installer's pages load Vite's client, and an edit reloads the page through
  the direct WebSocket fallback.
- Run by an AI agent, `astro dev` starts the server in the background; `astro dev stop` stops it. In a terminal it stays
  in the foreground.
