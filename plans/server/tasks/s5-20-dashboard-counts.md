---
type: Task
title: Count rooms and furni on housekeeping's dashboard
description: Housekeeping's dashboard shows how many rooms and furni the hotel has, as HoloCMS's did.
status: done
phase: s5
depends_on: [s5-04]
packages: [packages/store, packages/housekeeping]
client: []
timestamp: 2026-11-12T15:59:22+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-11T15:10:47+00:00"}
verified:
  - {by: claude-code/claude-fable-5-2, at: "2026-11-12T15:59:22+00:00"}
---

# Goal

The dashboard counts the hotel's rooms and furni ([0095](/decisions/0095-s5-builds-four-site-pieces.md)).

# Steps

- [x] The dashboard shows the count of rooms and the count of furni, where `source/holocms/housekeeping/dashboard.php`
  showed them, with its texts.
- [x] `plans/holo-port/reference/holo-differences.md` keeps only what still waits of the dashboard.
- [x] Tests.

# Verification

```sh
cd packages/store && go vet ./... && go test ./... && make check-docs
cd packages/housekeeping && go test ./... -race
make gates
```

Results:

- Housekeeping's dashboard shows `Rooms`, with `(of which <n> public rooms)`, and `Furniture`, after `Members`, where
  HoloCMS showed them. The store's `CountRooms`, `CountPublicRooms` and `CountFurni` count them.
- `plans/holo-port/reference/holo-differences.md` keeps the online count and `Server Setup` as what still waits of the
  dashboard.
- In `packages/store`, `go vet ./...`, `go test ./...` and `make check-docs` pass. In `packages/housekeeping`, the
  dashboard tests pass with `-race`, `TestTheDashboardCounts` with 14 rooms, 12 of them public, and 3 furni. `make
  gates` passes.

# Notes

- Runs on the branch `s5-dashboard-counts`.
- Chosen without asking: `Rooms` counts the habbo rooms and the public rooms together, as Holo's one table held both,
  and `Furniture` every piece of furni wherever it is, as Holo counted its table.
