---
type: Task
title: Handle help tickets
description: GET /help lists open tickets, and staff read, pick up, close and reply to them; closed tickets stay as history.
status: done
phase: hk-b
depends_on: [hk-b-06]
packages: [packages/store, packages/housekeeping]
holo: [source/holo/housekeeping/helper.php, source/holo/housekeeping/alert.php]
timestamp: 2026-11-02T20:21:55+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-02T19:41:44+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-02T20:21:55+00:00"}
---

# Goal

Staff with `housekeeping.help` work through the help queue as Holo's helper page did.

# Steps

- [x] List open tickets with Holo's columns, and show one ticket.
- [x] Pick up, and close only what was picked up, without deleting.
- [x] Quick Reply picks the ticket up and fills the alert form with Holo's text.

# Verification

```sh
# gofmt, go vet and go test -race in every module touched
make e2e
```

Results (2026-11-02T20:21:55+00:00):

- `gofmt`, `go vet` and `go test -race` pass in `packages/store` and `packages/housekeeping`, and `make check-docs` passes.
- `pnpm test housekeeping-access housekeeping-users` passes all 148 checks in a real browser: the queue, one ticket, a close
  refused before anyone picked it up, Quick Reply with Holo's text, and a closed ticket that leaves the queue and stays
  readable.
- Breaking these on purpose fails a test: the attribute of Quick Reply, a closed ticket, picking and closing twice, closing
  what nobody picked up, closed tickets in the queue, the private address, the ticket on the alert form and the log row.

# Notes

- None.
