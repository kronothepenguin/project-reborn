---
type: Task
title: Edit habbos and users
description: POST /habbos/{id} and POST /users/{id} save the fields of Holo's Edit User, taken from a list, only on users below the actor.
status: todo
phase: hk-b
depends_on: [hk-b-01]
packages: [packages/store, packages/housekeeping]
holo: [source/holo/housekeeping/edituser.php]
timestamp: 2026-11-02T19:41:44+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-02T19:41:44+00:00"}
---

# Goal

Staff with `housekeeping.usersEdit` change what Holo's Edit User changed, without taking column names from the form.

# Steps

- [ ] Save the motto, figure and gender of a habbo.
- [ ] Save the email, birth date, newsletter, tickets and film of a user; email and birth date take `housekeeping.usersPrivate`.
- [ ] A blank field keeps its value, as in Holo.
- [ ] Refuse users at or above the actor's level, and log the refusal.

# Verification

```sh
# gofmt, go vet and go test -race in every module touched
make e2e
```

# Notes

- None yet.
