---
type: Task
title: Find habbos and read them
description: GET /habbos and GET /habbos/{id} give Holo's user listing, its IP, user id and clone tools, and the habbo with its owner, other habbos and IP history.
status: done
phase: hk-b
depends_on: []
packages: [packages/store, packages/housekeeping]
holo: [source/holo/housekeeping/users.php, source/holo/housekeeping/ip.php, source/holo/housekeeping/uid.php, source/holo/housekeeping/cloner.php]
timestamp: 2026-11-02T19:46:21+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-02T19:41:44+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-02T19:46:21+00:00"}
---

# Goal

Staff find any habbo by name or id, and with `housekeeping.usersPrivate` by email or IP, as Holo's four search tools did.

# Steps

- [x] List and search habbos, archived ones too, with Holo's columns.
- [x] The page of one habbo: its owner, the owner's other habbos and the IP history.
- [x] Emails, birth dates and addresses take `housekeeping.usersPrivate`, in the search too.

# Verification

```sh
# gofmt, go vet and go test -race in every module touched
make e2e
```

Results (2026-11-02T19:46:21+00:00):

- `gofmt`, `go vet` and `go test -race` pass in `packages/store` and `packages/housekeeping`, and `make check-docs` passes.
- `pnpm test housekeeping-access housekeeping-users` passes all 73 checks in a real browser, with the two new routes behind
  the access checks.
- Breaking these on purpose fails a test: the private flag of the search and of its count, the emails of the list, the
  private part of the habbo page, the dedupe of addresses, and the edges of `Last Activity`.

# Notes

- The first run of the mutations missed the flag of the count, which decides `Older` and `Newer`. A search that counted
  what it hid would tell staff without `housekeeping.usersPrivate` that an address belongs to somebody, so a test now
  covers it.
