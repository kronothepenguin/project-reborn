---
type: Task
title: reborn installs a new hotel
description: Started in an empty folder, reborn serves the installer under /installer/ on the reborn defaults, redirects every other path there, moves to the address the administrator chooses, builds the hotel once the administrator exists, and answers 404 under /installer/ from then on.
status: todo
slice: platform
depends_on: [platform-03, platform-04]
packages: [packages/reborn]
sources: []
timestamp: 2026-11-13T15:20:00-05:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-13T15:20:00-05:00"}
---

# Goal

A new hotel is installed live in reborn, without a restart ([0004](/decisions/0004-the-installer-inside-reborn.md)).

# Steps

- [ ] Without `config.json`, `Run` listens on the `reborn` section's defaults and never calls `config.Load`, which
  would write the file. With it, it loads it and asks `installer.Installed`.
- [ ] Not installed: `installer.New` with the installer's `Site` and `WithListener`, mounted on the mux, and a
  middleware that redirects every path outside `/installer/` to `/installer/`.
- [ ] reborn's `Listener.Move`: listen on the new address (an error goes back to the form), serve the same handler
  there, redirect the browser to the same path on the new address (with `0.0.0.0` or `::`, keep the browser's host
  name), and shut the old server down right after the response, in a goroutine.
- [ ] On `Done()`: open the hotel's database handle, build the CMS, housekeeping and the game as
  [platform-03](/tasks/platform-03-reborn-runs-an-installed-hotel.md) does, mount them, start the game's listeners, and
  turn the middleware into one that answers 404 under `/installer/`. Log where `config.json` and the database are.
- [ ] Installed at start: the installer is not mounted, and `/installer/` answers 404.
- [ ] Tests from an empty temporary folder, on free ports: `/` and `/me` redirect to `/installer/`; the config step with
  another port lands on the new address and the old one refuses connections; the site and administrator steps end on
  `/` with the CMS's page; `/installer/` and `/installer/config` answer 404; `/housekeeping/` answers; a second `Run`
  in the same folder starts straight into the hotel.

# Verification

```sh
cd packages/reborn && go vet ./... && go test ./... -race
make gates
```

Results: written here once run.

# Notes

- Runs on the branch `platform-05`.
- `main.go` needs no change: the installer's `Site` is already passed by [platform-03](/tasks/platform-03-reborn-runs-an-installed-hotel.md).
