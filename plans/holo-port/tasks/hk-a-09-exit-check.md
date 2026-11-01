---
type: Task
title: Verify the HK-A exit criteria
description: Run housekeeping on the production binaries in a real browser, list the differences from Holo, and run every gate.
status: done
phase: hk-a
depends_on: [hk-a-08]
packages: [packages/housekeeping, apps/housekeeping]
holo: []
timestamp: 2026-11-01T22:17:21+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-01T21:07:47+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-01T22:17:21+00:00"}
---

# Goal

Every exit criterion of [HK-A](/phases/hk-a-housekeeping-core.md) holds on the production binaries.

# Steps

- [x] Install a hotel, then run the CMS and housekeeping side by side from a temporary `config.json`.
- [x] Walk every page in a real Chromium, as a guest, as non-staff, as staff missing attributes and as an administrator,
  and compare the layout with `docs/hk.png`.
- [x] Maintenance: turn it on in housekeeping, restart the CMS and see the maintenance page; turn it off, restart and see
  the site.
- [x] Add the "Housekeeping" section of [the differences](/reference/holo-differences.md).
- [x] Update [the programs](/reference/architecture.md) and [Holo housekeeping](/reference/holo-housekeeping.md).
- [x] Run every gate.

# Verification

```sh
# gofmt, go vet and go test -race in every module of go.work
pnpm --filter @project-reborn/components test
pnpm --filter @project-reborn/components check
pnpm --filter @project-reborn/cms build
pnpm --filter @project-reborn/installer build
pnpm --filter @project-reborn/housekeeping build
cd packages/store && go tool sqlc generate && git diff --exit-code -- db.go models.go '*.query.sql.go' && make check-docs
```

Results (2026-11-01):

- The exit criteria, on the production binaries, from an empty folder, in a real Chromium:
  - **A user without `housekeeping.access` gets 403 on every route.** A guest goes to `site.url` on all 13 routes, the static
    files included. A signed-in user gets 403 on all 13, and so does one holding every other attribute of housekeeping.
  - **Turning maintenance on shows the CMS maintenance page; deleting the row reverts it.** Saving it wrote the row, a running
    CMS kept serving, and after a restart the CMS answered 503 with the maintenance page. Saving it back deleted the row, and
    after a restart the CMS answered 200. `TestMaintenanceReachesTheCMSOnASharedMux` proves that on one mux the change applies
    at once, in both directions.
  - **Removing `housekeeping.accessGroups` from its last holder is refused**, with 422, its message and a log row, and so is
    removing `housekeeping.access` from that holder, or that holder from the group.
- 116 browser checks passed on the final code: 53 of access, 34 of the administrator's flow, 21 of the settings and 8 of
  maintenance, with no failed page and no panic or error in the server logs. Every screenshot was read and compared with
  `docs/hk.png`.
- Housekeeping created the database in an empty folder (35 tables, no users), sent a guest to `site.url`, and the installer
  then finished on that database.
- With the CMS stopped, so that only housekeeping could do it, an expired session was gone at the task's first run, a live
  one stayed, and the log stayed free of errors.
- The dev runner served all 6 pages with the astro dev server and no failed request, and `make dev` itself started both
  servers, with a guest going to `site.url` and Vite's paths answering through the runner.
- Each of the 10 commits, exported to an empty folder, passes `go vet` and `go test` in every module of its `go.work`, and
  the frontend builds in those that have housekeeping.
- `gofmt`, `go vet` and `go test -race` pass in all 13 modules of `go.work`, with 317 tests. 120 component tests and
  `svelte-check` pass, the frontends of the cms, the installer and housekeeping build, `sqlc generate` changes nothing,
  `make check-docs` passes, and `make install` leaves the tree clean.

# Notes

- The IPC of [0040](/decisions/0040-housekeeping-writes-settings.md) is not designed, so a running stand-alone CMS sees a
  settings change only at its next start, as [the programs](/reference/architecture.md) says. On one shared mux the
  settings are shared and the change applies at once, which a test proves.
- Vite emits its own paths, such as `/@vite/client`, at the root of the dev server whatever the base, and `Mount` leaves `/`
  alone, so every page of the dev runner lost them. The dev runner proxies `/` to astro; `Mount` is unchanged, and the
  production runner has no such route.
- `go work sync` moves `packages/config` to a direct requirement once the runners import it, so `make create`'s tidy had left
  `go.mod` files that the first `make install` rewrote. They are committed as it leaves them.
