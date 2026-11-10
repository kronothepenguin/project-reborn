---
type: Task
title: Check S4's exit criteria
description: From the merged work, check every exit criterion of S4 and close the phase.
status: todo
phase: s4
depends_on: [s4-01, s4-02, s4-03, s4-04, s4-05, s4-06, s4-07, s4-08, s4-10]
packages: [packages/server, packages/store, packages/virtual, packages/housekeeping]
client: []
timestamp: 2026-11-10T16:42:08+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-10T16:42:08+00:00"}
---

# Goal

S4 meets its [exit criteria](/phases/s4-rooms.md#exit-criteria) on `main`.

# Steps

- [ ] Every exit criterion of [S4](/phases/s4-rooms.md), checked one by one on the merged work.
- [ ] `packages/server/README.md` and the reference describe what S4 added.
- [ ] S4 is `done`; `/index.md` names the next phase.

# Verification

```sh
make install && make gates
cd packages/server && go test ./... -race -v
```

# Notes

- Runs on the branch `s4-exit-check`.
