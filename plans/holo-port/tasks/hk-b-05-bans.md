---
type: Task
title: Ban users and lift bans
description: GET /bans and POST /bans issue a ban with Holo's lengths and end the user's sessions, and POST /bans/{id}/lift lifts it and keeps it as history.
status: todo
phase: hk-b
depends_on: [hk-b-01]
packages: [packages/store, packages/housekeeping]
holo: [source/holo/housekeeping/bantool.php, source/holo/housekeeping/unbantool.php, source/holo/housekeeping/banlist.php]
timestamp: 2026-11-02T19:41:44+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-02T19:41:44+00:00"}
---

# Goal

Staff with `housekeeping.bans` ban a user, and their IP if they want, and lift bans; a banned user is out at once.

# Steps

- [ ] The ban form, in the look of Sulake's `Mass banning and kicking`, with Holo's lengths and a real `expires_at`.
- [ ] A ban ends every session of the user, in one transaction with its log row.
- [ ] The Active Ban Listing, with a Lift button; lifted bans stay in the table.
- [ ] Only on users below the actor; a refusal writes a log row.

# Verification

```sh
# gofmt, go vet and go test -race in every module touched
make e2e
```

# Notes

- None yet.
