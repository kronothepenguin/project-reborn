---
type: Task
title: Verify P3
description: Every exit criterion of P3 holds from a clean checkout, in a real browser.
status: done
phase: p3
depends_on: [p3-04, p3-05, p3-08, p3-09, p3-10, p3-11]
packages: [packages/cms, tests/e2e]
holo: []
timestamp: 2026-11-03T18:45:23+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-03T17:26:52+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-03T18:45:23+00:00"}
---

# Goal

The phase closes on results seen from a clean checkout.

# Steps

- [x] A guest reads a home.
- [x] The owner places, moves, re-skins and removes items and saves.
- [x] A purchase takes credits with a ledger row in the same transaction.
- [x] List the differences from Holo.
- [x] Run every gate.

# Verification

```sh
# gofmt, go vet and go test -race in every module touched
make e2e
```

Results (2026-11-03T18:45:23+00:00):

- From a clean checkout of `6d19242f`, `make install` and `make gates` passed and left the tree unchanged: `gofmt`, `go vet`
  and `go test -race` in every module, the component tests, `svelte-check`, the three frontends, `sqlc generate` and
  `make check-docs`.
- `make e2e` passed all 555 checks in 16 suites on the production binaries, with every server log clean.
- The exit criteria hold:
  - a guest reads a home, with its background, stickers, notes and profile widget in Holo's skins;
  - the owner places, moves, re-skins and removes items, and saves;
  - a purchase takes the credits and writes its ledger row in the same transaction.
- The differences from Holo are in [the reference](/reference/holo-differences.md).

# Notes

- A database installed before P3 has an empty home store, and is recreated with the installer
  ([0066](/decisions/0066-seeds-reach-a-database-through-the-installer.md)).
