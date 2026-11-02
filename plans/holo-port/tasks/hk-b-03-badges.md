---
type: Task
title: Give and remove badges
description: POST /habbos/{id}/badges gives a badge and wears it, as Holo's badge tool did, and POST /habbos/{id}/badges/{code}/delete removes one.
status: done
phase: hk-b
depends_on: [hk-b-02]
packages: [packages/store, packages/housekeeping]
holo: [source/holo/housekeeping/badgetool.php]
timestamp: 2026-11-02T19:59:53+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-02T19:41:44+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-02T19:59:53+00:00"}
---

# Goal

Staff with `housekeeping.usersEdit` give a habbo a badge, make one current, and take one away.

# Steps

- [x] Give a badge with Holo's 3 to 4 character rule, and make it the worn one.
- [x] A badge the habbo already has becomes the worn one, with Holo's message.
- [x] Remove a badge.
- [x] All of it only on users below the actor.

# Verification

```sh
# gofmt, go vet and go test -race in every module touched
make e2e
```

Results (2026-11-02T19:59:53+00:00):

- `gofmt`, `go vet` and `go test -race` pass in `packages/store` and `packages/housekeeping`, and `make check-docs` passes.
- `pnpm test housekeeping-access housekeeping-users` passes all 95 checks in a real browser.
- Breaking these on purpose fails a test: taking off the old badge, wearing a badge the habbo has, the upper case, the code
  check, both level checks, a badge the habbo does not have, and the code shown in the message.

# Notes

- None.
