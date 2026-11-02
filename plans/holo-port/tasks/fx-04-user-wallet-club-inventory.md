---
type: Task
title: Give the wallet, the club and the home inventory to the user
description: Wallets, club periods and the home inventory move from the habbo to the user, as decision 0056 says.
status: todo
phase: fx
depends_on: []
packages: [packages/store, packages/auth, packages/cms, packages/installer]
holo: []
timestamp: 2026-11-02T01:25:45+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-02T01:25:45+00:00"}
---

# Goal

All the habbos of a user share one purse, one club membership and one home inventory.

# Steps

- [ ] `wallets`, `club_subscriptions` and `home_inventory` are keyed by user, and `wallet_transactions` keeps which
  habbo acted.
- [ ] Queries, entity and table documents.
- [ ] `auth.CreateAccount`, `auth.CreateHabbo`, registration, the referral reward, `/me`, the account pages and the
  installer.
- [ ] A habbo added later no longer has a wallet of its own.

# Verification

```sh
# gofmt, go vet and go test -race in every module of go.work
pnpm --filter @project-reborn/components test
pnpm --filter @project-reborn/components check
make e2e
```

# Notes

- None yet.
