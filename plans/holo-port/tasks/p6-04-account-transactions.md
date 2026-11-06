---
type: Task
title: Show the account transactions
description: GET /credits/transactions lists the 50 newest rows of the user's ledger in Holo's table with a Habbo column, beside the purse.
status: todo
phase: p6
depends_on: [p6-03]
packages: [packages/cms, tests/e2e]
holo: [source/holocms/transactions.php]
timestamp: 2026-11-06T22:30:17+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-06T22:30:17+00:00"}
---

# Goal

A signed-in habbo reads the shared purse's history ([0104](/decisions/0104-transactions-show-the-habbo.md)).

# Steps

- [ ] `GET /credits/transactions`, signed in, lays out Holo's `transactions.php`: the brown `Account transactions` box
  with Holo's text and table, and the purse island in the second column.
- [ ] The table lists the 50 newest ledger rows of the user, newest first, in Holo's even and odd rows: Date in Holo's
  `d-m-Y H:i:s`, Activity, Description and Habbo, the habbo that acted or nothing.
- [ ] A row's description is its detail, or its reason when it has none, as housekeeping's transaction log shows it.
- [ ] Router tests, and the `credits` browser suite: rows of two habbos of one user, the 50-row limit and a guest
  sent to sign in.
- [ ] The Habbo column in [Holo's differences](/reference/holo-differences.md).

# Verification

```sh
# gofmt, go vet and go test -race in packages/cms; pnpm check in packages/cms
cd tests/e2e && node run.mjs credits
```

# Notes

- Holo's table had no pages, and showed its 50 rows only.
