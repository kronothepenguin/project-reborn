---
type: Task
title: Give credits and read transactions
description: POST /habbos/{id}/credits changes the user's wallet and its ledger together, and GET /habbos/{id}/transactions lists the ledger.
status: todo
phase: hk-b
depends_on: [hk-b-01]
packages: [packages/store, packages/housekeeping]
holo: [source/holo/housekeeping/givecredits.php, source/holo/housekeeping/transactions.php]
timestamp: 2026-11-02T19:41:44+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-02T19:41:44+00:00"}
---

# Goal

Staff with `housekeeping.credits` give or take credits, and read where a user's credits went.

# Steps

- [ ] Change the wallet with a guard against going below zero, and write the ledger row in the same transaction.
- [ ] Refuse amounts that are not whole numbers or are too large for the wallet.
- [ ] List the ledger of the user, with the habbo that acted, in pages.
- [ ] Only on users below the actor.

# Verification

```sh
# gofmt, go vet and go test -race in every module touched
make e2e
```

# Notes

- None yet.
