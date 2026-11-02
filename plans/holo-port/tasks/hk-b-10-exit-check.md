---
type: Task
title: Verify HK-B
description: Every exit criterion of HK-B holds from a clean checkout, in a real browser.
status: done
phase: hk-b
depends_on: [hk-b-02, hk-b-03, hk-b-04, hk-b-05, hk-b-06, hk-b-07, hk-b-08, hk-b-09, hk-b-11]
packages: [packages/housekeeping, tests/e2e]
holo: []
timestamp: 2026-11-02T20:44:56+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-02T19:41:44+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-02T20:44:56+00:00"}
---

# Goal

The phase closes on results seen from a clean checkout.

# Steps

- [x] Run the HK-B flows on the production binaries in a real browser.
- [x] A banned user's sessions end, and their next login shows the reason and the expiry.
- [x] Every action wrote a staff log row with the actor and the target.
- [x] List the differences from Holo.
- [x] Run every gate.

# Verification

```sh
# gofmt, go vet and go test -race in every module touched
make e2e
```

Results (2026-11-02T20:44:56+00:00):

- From a clean checkout, `make install` and `make gates` passed and left the tree unchanged: `gofmt`, `go vet` and `go test -race`
  in every module, the component tests, `svelte-check`, the three frontends, `sqlc generate` and `make check-docs`.
- `make e2e` passed all 498 checks in 14 suites on the production binaries, with every server log clean.
- The exit criteria hold:
  - every action writes a staff log row with the actor and the target, checked action by action in the Go tests and on
    the staff log page in a real browser; a mass alert has no single target, and neither does a ban on an address alone;
  - a signed-in user who is banned is out at once, and their next login shows the reason and the expiry.
- The screenshots of the listing, the habbo page, the ledger, bans, alerts, the queue and a ticket were read by eye, which
  found [hk-b-11](/tasks/hk-b-11-screenshot-fixes.md).
- The differences from Holo are in [the reference](/reference/holo-differences.md).

# Notes

- The clean run was on tree `2f1c04c7`. A note in `entities/ban.md` came after it, and `make check-docs` passed on that alone.
