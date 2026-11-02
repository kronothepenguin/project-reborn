---
type: Task
title: Restore archived habbos
description: Staff restore an archived habbo from its page, unless that takes the user past registration.maxHabbosPerUser.
status: done
phase: hk-b
depends_on: [hk-b-02]
packages: [packages/store, packages/housekeeping]
holo: []
timestamp: 2026-11-02T20:33:39+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-02T19:41:44+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-02T20:33:39+00:00"}
---

# Goal

An archived habbo can come back, as decision 0058 says.

# Steps

- [x] `POST /habbos/{id}/restore` clears `archived_at`, only on users below the actor.
- [x] Refuse when the user already has as many habbos as they may own.

# Verification

```sh
# gofmt, go vet and go test -race in every module touched
make e2e
```

Results (2026-11-02T20:33:39+00:00):

- `gofmt`, `go vet` and `go test -race` pass in `packages/store` and `packages/housekeeping`, and `make check-docs` passes.
- `pnpm test housekeeping-access housekeeping-users` passes all 159 checks in a real browser: an archived habbo is restored
  and signs in.
- Breaking these on purpose fails a test: the level check, the limit and its edge, a habbo that is not archived and the
  log row.

# Notes

- None.
