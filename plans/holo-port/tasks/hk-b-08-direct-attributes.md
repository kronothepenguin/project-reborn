---
type: Task
title: Give direct attributes
description: The habbo page lets holders of housekeeping.accessGroups give attributes to the user directly, only on users below them.
status: todo
phase: hk-b
depends_on: [hk-b-02]
packages: [packages/store, packages/housekeeping]
holo: []
timestamp: 2026-11-02T19:41:44+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-02T19:41:44+00:00"}
---

# Goal

A trusted user gets one extra permission without a new group, as decision 0053 says.

# Steps

- [ ] Tick boxes of the catalogue on the habbo page, showing what the user has directly.
- [ ] `POST /users/{id}/attributes` saves them, only on users below the actor.

# Verification

```sh
# gofmt, go vet and go test -race in every module touched
make e2e
```

# Notes

- None yet.
