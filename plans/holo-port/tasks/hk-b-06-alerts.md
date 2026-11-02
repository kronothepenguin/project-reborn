---
type: Task
title: Send alerts
description: GET /alerts and POST /alerts alert one habbo, or everyone with housekeeping.alertsBroadcast, and list the alerts not dismissed yet.
status: todo
phase: hk-b
depends_on: [hk-b-01]
packages: [packages/store, packages/housekeeping]
holo: [source/holo/housekeeping/alert.php, source/holo/housekeeping/massalert.php, source/holo/housekeeping/alertlist.php]
timestamp: 2026-11-02T19:41:44+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-02T19:41:44+00:00"}
---

# Goal

Staff with `housekeeping.alerts` alert a habbo, and those who may alert everyone do so from the same page.

# Steps

- [ ] Alert one habbo by name.
- [ ] Alert every habbo that is not archived, with `housekeeping.alertsBroadcast`, in one transaction with its log row.
- [ ] The Active Alerts Listing, in pages.

# Verification

```sh
# gofmt, go vet and go test -race in every module touched
make e2e
```

# Notes

- None yet.
