---
type: Task
title: Give credits and read transactions
description: POST /habbos/{id}/credits changes the user's wallet and its ledger together, and GET /habbos/{id}/transactions lists the ledger.
status: done
phase: hk-b
depends_on: [hk-b-01]
packages: [packages/store, packages/housekeeping]
holo: [source/holo/housekeeping/givecredits.php, source/holo/housekeeping/transactions.php]
timestamp: 2026-11-02T20:03:33+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-02T19:41:44+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-02T20:03:33+00:00"}
---

# Goal

Staff with `housekeeping.credits` give or take credits, and read where a user's credits went.

# Steps

- [x] Change the wallet with a guard against going below zero, and write the ledger row in the same transaction.
- [x] Refuse amounts that are not whole numbers or are too large for the wallet.
- [x] List the ledger of the user, with the habbo that acted, in pages.
- [x] Only on users below the actor.

# Verification

```sh
# gofmt, go vet and go test -race in every module touched
make e2e
```

Results (2026-11-02T20:03:33+00:00):

- `gofmt`, `go vet` and `go test -race` pass in `packages/store` and `packages/housekeeping`, and `make check-docs` passes.
- `pnpm test housekeeping-access housekeeping-users` passes all 104 checks in a real browser.
- Breaking these on purpose fails a test: the level check, the guard at zero in the query, an amount that did not apply,
  both limits of the amount, the ledger row, the log row and the amount shown in the message.

# Notes

- The first run of the mutations missed the lower limit of the amount, because the guard at zero answers the same on an
  empty wallet. The test now has a wallet that could pay, so only the limit refuses.
