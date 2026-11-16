---
type: Task
title: reborn-dev and make dev
description: reborn-dev resolves and proxies every site from the one Astro dev server of the spike, and make dev runs it with air and the dev server.
scope: [packages/reborn, apps/reborn, Makefile]
depends_on: [11-spike-one-dev-server]
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

# Steps

- [ ] `apps/reborn/cmd/reborn-dev/main.go`: each `Site` from `astro.MakeServerResolver` and a reverse proxy of the dev
  server, as `cms-dev` does, and the dev server's root paths proxied as `housekeeping-dev` does.
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
