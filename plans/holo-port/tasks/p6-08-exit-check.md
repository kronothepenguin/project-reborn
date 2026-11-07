---
type: Task
title: Verify P6
description: Every exit criterion of P6 holds from a clean checkout, in a real browser.
status: todo
phase: p6
depends_on: [p6-01, p6-02, p6-03, p6-04, p6-05, p6-06, p6-07, p6-09, p6-11]
packages: [packages/cms, packages/housekeeping, packages/store, tests/e2e]
holo: []
timestamp: 2026-11-06T22:30:17+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-06T22:30:17+00:00"}
---

# Goal

P6 meets its [exit criteria](/phases/p6-economy.md#exit-criteria).

# Steps

- [ ] From a clean worktree of `main`: install, every gate, and every browser suite.
- [ ] A voucher made in housekeeping is redeemed on `/credits`: the voucher is marked redeemed and the purse and the
  ledger change in one transaction, and a second redemption gives nothing.
- [ ] A club purchase shows on `/club`, the Me page, the account pages and `/credits/transactions`; while it runs the
  home editor offers the club skins, the home's playground is 922 pixels wide and `/account/looks` shows the wardrobe,
  and once it ends they go, with `HC1`.
- [ ] [Holo's differences](/reference/holo-differences.md) lists every difference P6 made.
- [ ] P6 is done, and the next phase is active.

# Verification

```sh
pnpm install --frozen-lockfile --prefer-offline && make gates
cd tests/e2e && pnpm test
```
