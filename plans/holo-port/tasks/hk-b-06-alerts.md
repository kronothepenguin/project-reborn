---
type: Task
title: Send alerts
description: GET /alerts and POST /alerts alert one habbo, or everyone with housekeeping.alertsBroadcast, and list the alerts not dismissed yet.
status: done
phase: hk-b
depends_on: [hk-b-01]
packages: [packages/store, packages/housekeeping]
holo: [source/holo/housekeeping/alert.php, source/holo/housekeeping/massalert.php, source/holo/housekeeping/alertlist.php]
timestamp: 2026-11-02T20:17:56+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-02T19:41:44+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-02T20:17:56+00:00"}
---

# Goal

Staff with `housekeeping.alerts` alert a habbo, and those who may alert everyone do so from the same page.

# Steps

- [x] Alert one habbo by name.
- [x] Alert every habbo that is not archived, with `housekeeping.alertsBroadcast`, in one transaction with its log row.
- [x] The Active Alerts Listing, in pages.

# Verification

```sh
# gofmt, go vet and go test -race in every module touched
make e2e
```

Results (2026-11-02T20:17:56+00:00):

- `gofmt`, `go vet` and `go test -race` pass in `packages/store` and `packages/housekeeping`, and `make check-docs` passes.
- `pnpm test housekeeping-access housekeeping-users` passes all 129 checks in a real browser: an alert reaches the habbo's
  page, and a mass alert counts every habbo.
- Breaking these on purpose fails a test: an archived habbo, a blank alert, the attribute of the mass alert, a blank mass
  form, the type of the listing, the archived habbos of a mass alert, dismissed alerts in the list and the log row.

# Notes

- None.
