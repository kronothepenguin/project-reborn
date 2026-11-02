---
type: Task
title: Give direct attributes
description: The habbo page lets holders of housekeeping.accessGroups give attributes to the user directly, only on users below them.
status: done
phase: hk-b
depends_on: [hk-b-02]
packages: [packages/store, packages/housekeeping]
holo: []
timestamp: 2026-11-02T20:28:21+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-02T19:41:44+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-02T20:28:21+00:00"}
---

# Goal

A trusted user gets one extra permission without a new group, as decision 0053 says.

# Steps

- [x] Tick boxes of the catalogue on the habbo page, showing what the user has directly.
- [x] `POST /users/{id}/attributes` saves them, only on users below the actor.

# Verification

```sh
# gofmt, go vet and go test -race in every module touched
make e2e
```

Results (2026-11-02T20:28:21+00:00):

- `gofmt`, `go vet` and `go test -race` pass in `packages/store` and `packages/housekeeping`, and `make check-docs` passes.
- `pnpm test housekeeping-access housekeeping-users` passes all 153 checks in a real browser.
- Breaking these on purpose fails a test: the level check, the catalogue, removing a box, the habbo's owner, the form for
  those without the attribute, and listing the attributes of one user alone.

# Notes

- The first run of the mutations missed a query that listed everyone's attributes, because no test had two users holding
  direct attributes. One does now.
