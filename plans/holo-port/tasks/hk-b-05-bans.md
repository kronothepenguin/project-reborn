---
type: Task
title: Ban users and lift bans
description: GET /bans and POST /bans issue a ban with Holo's lengths and end the user's sessions, and POST /bans/{id}/lift lifts it and keeps it as history.
status: done
phase: hk-b
depends_on: [hk-b-01]
packages: [packages/store, packages/housekeeping]
holo: [source/holo/housekeeping/bantool.php, source/holo/housekeeping/unbantool.php, source/holo/housekeeping/banlist.php]
timestamp: 2026-11-02T20:10:33+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-02T19:41:44+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-02T20:10:33+00:00"}
---

# Goal

Staff with `housekeeping.bans` ban a user, and their IP if they want, and lift bans; a banned user is out at once.

# Steps

- [x] The ban form, in the look of Sulake's `Mass banning and kicking`, with Holo's lengths and a real `expires_at`.
- [x] A ban ends every session of the user, in one transaction with its log row.
- [x] The Active Ban Listing, with a Lift button; lifted bans stay in the table.
- [x] Only on users below the actor; a refusal writes a log row.

# Verification

```sh
# gofmt, go vet and go test -race in every module touched
make e2e
```

Results (2026-11-02T20:10:33+00:00):

- `gofmt`, `go vet` and `go test -race` pass in `packages/store` and `packages/housekeeping`, and `make check-docs` passes.
- `pnpm test housekeeping-access housekeeping-users` passes all 120 checks in a real browser: a signed-in user is out at once
  when banned, their next login shows the reason and the expiry, and after the lift they sign in.
- Breaking these on purpose fails a test: the level checks of banning and lifting, the end of the sessions, a ban on an
  address alone, a second lift, the form of the address, the owner in the message, the lengths, and the lifted and
  expired rows of the list.

# Notes

- `Permenantly (25 Years)` is a real date 25 years away, as in Holo, so `bans.expires_at` stays NULL for bans no form writes.
- Lifted and expired bans stay in the table and in the staff log, and the list shows active bans only.
