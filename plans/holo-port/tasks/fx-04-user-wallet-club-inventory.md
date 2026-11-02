---
type: Task
title: Give the wallet, the club and the home inventory to the user
description: Wallets, club periods and the home inventory move from the habbo to the user, as decision 0056 says.
status: done
phase: fx
depends_on: []
packages: [packages/store, packages/auth, packages/cms, packages/installer]
holo: []
timestamp: 2026-11-02T01:51:55+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-02T01:25:45+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-02T01:51:55+00:00"}
---

# Goal

All the habbos of a user share one purse, one club membership and one home inventory.

# Steps

- [x] `wallets`, `club_subscriptions` and `home_inventory` are keyed by user, and `wallet_transactions` keeps which
  habbo acted.
- [x] Queries, entity and table documents.
- [x] `auth.CreateAccount`, `auth.CreateHabbo`, registration, the referral reward, `/me`, the account pages and the
  installer.
- [x] A habbo added later no longer has a wallet of its own.

# Verification

```sh
# gofmt, go vet and go test -race in every module of go.work
pnpm --filter @project-reborn/components test
pnpm --filter @project-reborn/components check
make e2e
```

Results (2026-11-02T01:51:55+00:00):

- `gofmt`, `go vet` and `go test -race` pass in `packages/store`, `packages/auth`, `packages/cms`, `packages/installer` and
  `packages/housekeeping`. `sqlc generate` changes nothing further, and `make check-docs` passes.
- `make e2e` passed all 365 checks, with the habbos suite proving a second habbo adds no wallet and shows the same credits.
- Seven breaks made on purpose were each caught: the referral paying the new user, the wallet or the club read by habbo on
  `/me`, the club read by habbo on the account pages, the ledger forgetting the habbo, no ledger row, and a ledger row with no
  credits.

# Notes

- The break on the account pages survived at first, because in that test the user and the habbo have the same id. The check
  now runs as a second habbo, whose ids differ, and it catches the break.
- `home_inventory` has no callers yet. It moves now so that [P3](/phases/p3-homes.md) starts on the right table.
- `CREATE TABLE IF NOT EXISTS` does not change an existing table, so a database from before this commit must be recreated.
