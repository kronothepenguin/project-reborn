---
type: Reference
title: Under /housekeeping
description: How housekeeping lives under the /housekeeping prefix, alone on its own port and on one mux with the CMS, and what each runner serves.
---

# The prefix

Every route lives under `/housekeeping/` (decision holo-port/0003).

- `Mount` registers only `/housekeeping/...`, and `/housekeeping/` for the static files through `http.StripPrefix`, so
  it runs alone on its own port and on one mux with the CMS.
- `base: "/housekeeping"` in `astro.config.mjs` gives the same prefix to the built pages, and the dev resolver's base
  URL includes it.
- Housekeeping signs staff in through the shared session of `packages/auth`. On a shared mux the cookie is
  the CMS's, and alone it arrives because cookies are the same on every port of a host.

# The runners

`apps/housekeeping` holds two runners.

| cmd | Mode | Resolver and static |
| --- | --- | --- |
| `./cmd/housekeeping` | production | `astro.MakeFSResolver` (embedded dist) and `http.FileServerFS` |
| `./cmd/housekeeping-dev` | development | `astro.MakeServerResolver` and a reverse proxy to the astro dev server |

The dev runner also proxies `/` to the astro dev server, because Vite emits its own paths, such as `/@vite/client`, at
the root whatever the base. The production runner serves `/housekeeping/` alone.
