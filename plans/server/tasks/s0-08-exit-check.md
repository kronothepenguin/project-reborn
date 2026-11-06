---
type: Task
title: Check S0's exit criteria
description: From a clean checkout of the merged work, check every exit criterion of S0, bring the reference up to date and close the phase.
status: todo
phase: s0
depends_on: [s0-01, s0-02, s0-03, s0-04, s0-05, s0-06, s0-07]
packages: [packages/server, apps/server, tools/create]
client: []
timestamp: 2026-11-05T20:57:45+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T20:57:45+00:00"}
---

# Goal

S0 meets its [exit criteria](/phases/s0-foundations.md#exit-criteria) on `main`.

# Steps

- [ ] In a fresh worktree of `main` merged into `s0`: `make install` and `make gates`.
- [ ] The test client receives `HELLO` and its `INIT_CRYPTO` is logged by name, on the `info` WebSocket listener.
- [ ] One project of each template passes its gates, in a throwaway worktree.
- [ ] [How the server is built](/reference/architecture.md) matches the code.
- [ ] S0 is `done`; `/index.md` names the active phases.

# Verification

```sh
make install && make gates
cd packages/server && go test ./... -race -v
```

# Notes

- Runs on the branch `s0`, and ends it: the branch is merged as [Branches](/rules.md#branches) says.
