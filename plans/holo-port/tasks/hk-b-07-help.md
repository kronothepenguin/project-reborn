---
type: Task
title: Handle help tickets
description: GET /help lists open tickets, and staff read, pick up, close and reply to them; closed tickets stay as history.
status: todo
phase: hk-b
depends_on: [hk-b-06]
packages: [packages/store, packages/housekeeping]
holo: [source/holo/housekeeping/helper.php, source/holo/housekeeping/alert.php]
timestamp: 2026-11-02T19:41:44+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-02T19:41:44+00:00"}
---

# Goal

Staff with `housekeeping.help` work through the help queue as Holo's helper page did.

# Steps

- [ ] List open tickets with Holo's columns, and show one ticket.
- [ ] Pick up, and close only what was picked up, without deleting.
- [ ] Quick Reply picks the ticket up and fills the alert form with Holo's text.

# Verification

```sh
# gofmt, go vet and go test -race in every module touched
make e2e
```

# Notes

- None yet.
