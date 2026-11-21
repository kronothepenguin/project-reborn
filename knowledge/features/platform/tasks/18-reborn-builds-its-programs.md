---
type: Task
title: reborn builds its programs, and the runner owns the HTTP server
description: packages/reborn builds the site, housekeeping, the installer and the game and mounts them on a mux it receives; the runners of apps/reborn own the HTTP server, replace it after the installation, and stop in order on Ctrl-C; the game's own runner stops in order too.
scope: [packages/reborn, apps/reborn, apps/server, tests/e2e]
depends_on: []
skills: [applying-go-patterns, testing-behaviours, use-modern-go]
---

# Goal

`packages/reborn` follows [0015](/decisions/reborn/0015-the-runner-owns-reborns-http-server.md). The shape is "reborn's new shape" in the [plan](/features/platform/plan.md).

# Context

- [Spec](/features/platform/spec.md), the lines under `## Next`.
- [Plan](/features/platform/plan.md), "reborn's new shape": build it exactly as written there.
- [Lifecycle names come in pairs](/decisions/reborn/0016-lifecycle-names-come-in-pairs.md)
- `packages/reborn/reborn.go` of today, for the redirect before the installation and the move to a new address.
- The branch `reborn-dist-spike`: the build of reborn's Astro project, proven on 2026-11-20. Start from it.

# Steps

- [ ] Merge the branch `reborn-dist-spike` into your branch. `packages/reborn` embeds its `dist` as `DistFS`, and
  `make frontends` builds it.
- [ ] reborn hands each site its pages and files under the site's base: the site at the root, housekeeping under
  `housekeeping`, the installer under `installer`, from the one resolver and the one file handler it is given.
- [ ] Before the installation the files pass, so the installer's stylesheet at `/_astro/` loads.
- [ ] `packages/reborn`: `New`, the two options, `Installed`, `WaitForInstall`, `MountInstaller`, `Mount`, `Start` and `Stop`, as the
  plan shows them. `Run`, the HTTP server and the goroutine that waits for the installation go.
- [ ] `apps/reborn/internal/web`: the HTTP server, `Serve` that replaces the running server on the open listener,
  `Move` for the installer, and `Shutdown`.
- [ ] `apps/reborn/cmd/reborn` and `apps/reborn/cmd/reborn-dev`: the flow of the plan.
- [ ] `apps/server/cmd/server/main.go`: wait for Ctrl-C or SIGTERM, call the game's `Stop`, close the database.
- [ ] Tests: a hotel that is not installed sends pages to `/installer/`; after the administrator exists the site
  answers on the same address; a move to a new port answers there; `Start` returns the game's error; after `Stop` each
  player is logged out with its last time online saved.
- [ ] Update `packages/reborn/knowledge` and `apps/reborn`'s documents.

# Checks

```sh
make -C packages/reborn check
make -C apps/reborn check
make -C apps/server check
make e2e
```
