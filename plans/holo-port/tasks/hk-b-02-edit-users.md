---
type: Task
title: Edit habbos and users
description: POST /habbos/{id} and POST /users/{id} save the fields of Holo's Edit User, taken from a list, only on users below the actor.
status: done
phase: hk-b
depends_on: [hk-b-01]
packages: [packages/store, packages/housekeeping]
holo: [source/holo/housekeeping/edituser.php]
timestamp: 2026-11-02T19:53:21+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-02T19:41:44+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-02T19:53:21+00:00"}
---

# Goal

Staff with `housekeeping.usersEdit` change what Holo's Edit User changed, without taking column names from the form.

# Steps

- [x] Save the motto, figure and gender of a habbo.
- [x] Save the email, birth date, newsletter, tickets and film of a user; email and birth date take `housekeeping.usersPrivate`.
- [x] A blank field keeps its value, as in Holo.
- [x] Refuse users at or above the actor's level, and log the refusal.

# Verification

```sh
# gofmt, go vet and go test -race in every module touched
make e2e
```

Results (2026-11-02T19:53:21+00:00):

- `gofmt`, `go vet` and `go test -race` pass in `packages/store` and `packages/housekeeping`, and `make check-docs` passes.
- `pnpm test housekeeping-access housekeeping-users` passes all 87 checks in a real browser.
- Breaking these on purpose fails a test: both level checks, the refusal's log row, the blank field, the private fields,
  the email and look checks, the limits of tickets and film, the motto counted in characters, and the habbo's owner.

# Notes

- None.
