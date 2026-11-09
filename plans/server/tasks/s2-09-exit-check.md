---
type: Task
title: Check S2's exit criteria
description: From the merged work, check every exit criterion of S2 and close the phase.
status: todo
phase: s2
depends_on: [s2-01, s2-02, s2-03, s2-04, s2-05, s2-06, s2-07, s2-08]
packages: [packages/server, packages/auth, packages/store]
client: []
timestamp: 2026-11-09T22:15:00+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-09T22:15:00+00:00"}
---

# Goal

S2 meets its [exit criteria](/phases/s2-login.md#exit-criteria) on `main`.

# Steps

- [ ] Every exit criterion of [S2](/phases/s2-login.md), checked one by one on the merged work.
- [ ] `packages/server/README.md` and the reference describe what S2 added.
- [ ] S2 is `done`; `/index.md` names the active phases.

# Verification

```sh
make install && make gates
cd packages/server && go test ./... -race -v
```

# Notes

- Runs on the branch `s2-exit-check`.
