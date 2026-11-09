---
type: Task
title: Verify P6
description: Every exit criterion of P6 holds from a clean checkout, in a real browser.
status: done
phase: p6
depends_on: [p6-01, p6-02, p6-03, p6-04, p6-05, p6-06, p6-07, p6-09, p6-10, p6-11, p6-12]
packages: [packages/cms, packages/housekeeping, packages/store, tests/e2e]
holo: []
timestamp: 2026-11-09T17:52:05+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-06T22:30:17+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-09T17:52:05+00:00"}
---

# Goal

P6 meets its [exit criteria](/phases/p6-economy.md#exit-criteria).

# Steps

- [x] From a clean worktree of `main`: install, every gate, and every browser suite.
- [x] A voucher made in housekeeping is redeemed on `/credits`: the voucher is marked redeemed and the purse and the
  ledger change in one transaction, and a second redemption gives nothing.
- [x] A club purchase shows on `/club`, the Me page, the account pages and `/credits/transactions`; while it runs the
  home editor offers the club skins, the home's playground is 922 pixels wide and `/account/looks` shows the wardrobe,
  and once it ends they go, with `HC1`.
- [x] [Holo's differences](/reference/holo-differences.md) lists every difference P6 made.
- [x] P6 is done, and the next phase is active.

# Verification

```sh
pnpm install --frozen-lockfile --prefer-offline && make gates
cd tests/e2e && pnpm test
```

Results (2026-11-09T17:52:05+00:00):

- A fresh worktree of `main` at `f6362665`, holding only committed files and this task's suite, stands for the clean
  checkout. `make install` passes and changes no tracked file.
- `make gates` passes: every Go module's `gofmt`, `go vet` and `go test -race`, 26 packages with tests, the
  components' 167 tests and `svelte-check` with 0 errors and 0 warnings, the sqlc diff and the store's docs check.
- `make e2e`: all 30 browser suites pass, 1083 checks.
- The new suite `economy`, 11 checks, walks the exit criteria in one go. Admin-1 makes a voucher of 50 credits in
  housekeeping, and Frank redeems it on `/credits`: the voucher is kept as redeemed by his habbo, and the purse and the
  ledger gain its 50 credits; a second redemption gives nothing. Outside the club his home is 752 pixels wide beside
  the club banner, the home editor offers no club skin and the looks have no wardrobe. He buys a month on `/club`,
  which shows the membership and 31 days, takes 20 credits and gives `HC1` to both his habbos, his active one wearing
  it; `/credits/transactions` lists the purchase above the voucher, both by Frank; the Me page and the account pages
  count 31 days; the home editor offers `HC Bling` and `HC Scifi`, the playground is 922 pixels wide and the looks
  show 5 wardrobe slots. Once the club ends, `/club` says so, `HC1` leaves both habbos, and the days, the club skins,
  the wide playground and the wardrobe go.
- The redemption runs in one transaction, `r.inTx` in `packages/cms/internal/router/credits-vouchers.go`, which
  `TestRedeemingAVoucherFillsThePurseAndTheLedger` and `TestAVoucherRedeemsOnce` cover.
- Every P6 task that made a difference recorded it in [Holo's differences](/reference/holo-differences.md): p6-01,
  p6-03, p6-04, p6-05, p6-06, p6-07, p6-10 and p6-12. p6-02, p6-09 and p6-11 made none.

# Notes

- `seedStaff` writes its habbos row by row, without the profile widget that creating a habbo places, so `economy`'s
  `prepare` places Frank's as `CreateHabbo` does.
- The gates ran in this worktree before the task's commit, and `main` had not moved since.
