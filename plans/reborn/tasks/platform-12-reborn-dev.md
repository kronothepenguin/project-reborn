---
type: Task
title: reborn-dev and make dev
description: reborn-dev resolves and proxies every site from the one Astro dev server of the spike, and make dev runs it with air and the dev server.
status: todo
slice: platform
depends_on: [platform-11]
packages: [packages/reborn, apps/reborn, Makefile]
sources: []
timestamp: 2026-11-13T15:20:00-05:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-13T15:20:00-05:00"}
---

# Goal

`make dev` runs the whole hotel with live reload of every page and of the Go code
([0009](/decisions/0009-one-dev-server-for-reborn.md)).

# Steps

- [ ] `apps/reborn/cmd/reborn-dev/main.go` is the user's file: write its proposed content under `# Notes` (each `Site`
  from `astro.MakeServerResolver` and a reverse proxy of the dev server, as `cms-dev` does, and the dev server's root
  paths proxied as `housekeeping-dev` does), and stop for the coordinator to ask.
- [ ] `apps/reborn/.air.toml` and `apps/reborn/Makefile`'s `dev`, which run air from the repository root and the dev
  server, as `apps/cms` does; the root `Makefile`'s `dev` comes back.
- [ ] `apps/reborn/README.md` says how to run it.

# Verification

```sh
cd apps/reborn && go vet ./... && go build ./...
make gates
```

Results: written here once run, with `make dev` tried on a free port.

# Notes

- Runs on the branch `platform-12`.
- reborn uses 16416; the user's CMS dev runner may hold 17387, which reborn does not use.
