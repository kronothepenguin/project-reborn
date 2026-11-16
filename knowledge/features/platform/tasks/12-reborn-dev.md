---
type: Task
title: reborn-dev and make dev
description: reborn-dev resolves and proxies every site from the one Astro dev server of the spike, and make dev runs it with air and the dev server.
scope: [packages/reborn, apps/reborn, Makefile]
depends_on: [11-spike-one-dev-server, 17-hand-reborn-the-programs]
skills: []
---

# Goal

`make dev` runs the whole hotel with live reload of every page and of the Go code
([0009](/decisions/reborn/0009-one-dev-server-for-reborn.md)).

# Context

- [Spec](/features/platform/spec.md)
- [Plan](/features/platform/plan.md)
- [reborn's dev runner proxies one Astro dev server for every site, after a spike proves
  it](/decisions/reborn/0009-one-dev-server-for-reborn.md)
- reborn uses 16416; the user's CMS dev runner may hold 17387, which reborn does not use.

- The spike of task 11 proved the dev server: `packages/reborn/knowledge/dev-server.md`. One static proxy of the
  server's root (`http://localhost:16417/`) serves every site, because a request keeps its `/housekeeping/` or
  `/installer/` prefix; each site has its own resolver, with the base addresses `http://localhost:16417/`,
  `http://localhost:16417/housekeeping/` and `http://localhost:16417/installer/`.
- `astro dev` of Astro 7 went to the background by itself in the spike (`astro dev stop`, `status` and `logs` control
  it): check how `make dev` keeps it in the foreground with air.
- The dev server's port: take the Astro port `tools/create` gives the name `reborn`, and say in the report when it
  differs from the spike's 16417.

# Steps

- [ ] `apps/reborn/cmd/reborn-dev/main.go` builds each program as `apps/reborn/cmd/reborn/main.go` does, with the
  resolver of `astro.MakeServerResolver` and a reverse proxy of the dev server in place of the built files, as
  `cms-dev` does, and the dev server's root paths proxied as `housekeeping-dev` does. A base address ends in `/`
  (`http://localhost:25050/`), so `JoinPath` keeps the leading slash.
- [ ] `apps/reborn/.air.toml` and `apps/reborn/Makefile`'s `dev`, which run air from the repository root and the dev
  server, as `apps/cms` does; the root `Makefile`'s `dev` comes back.
- [ ] `apps/reborn/README.md` says how to run it.

# Checks

```sh
make -C packages/reborn check
make -C apps/reborn check
```

Then `make check` in every project that `make dependants project=<folder>` prints for `packages/reborn`, `apps/reborn`.

Results: written in the report once run, with `make dev` tried on a free port.
