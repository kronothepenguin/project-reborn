---
type: Task
title: Count rooms and furni on housekeeping's dashboard
description: Housekeeping's dashboard shows how many rooms and furni the hotel has, as HoloCMS's did.
status: todo
phase: s5
depends_on: [s5-04]
packages: [packages/store, packages/housekeeping]
client: []
timestamp: 2026-11-11T15:10:47+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-11T15:10:47+00:00"}
---

# Goal

The dashboard counts the hotel's rooms and furni ([0095](/decisions/0095-s5-builds-four-site-pieces.md)).

# Steps

- [ ] The dashboard shows the count of rooms and the count of furni, where `source/holocms/housekeeping/dashboard.php`
  showed them, with its texts.
- [ ] `plans/holo-port/reference/holo-differences.md` keeps only what still waits of the dashboard.
- [ ] Tests.

# Verification

```sh
cd packages/store && go vet ./... && go test ./... && make check-docs
cd packages/housekeeping && go test ./... -race
make gates
```

# Notes

- Runs on the branch `s5-dashboard-counts`.
