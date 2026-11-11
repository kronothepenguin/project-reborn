---
type: Task
title: Redeem item vouchers on the site
description: A voucher gives credits or a furni; housekeeping's Voucher Management makes item vouchers by sprite name, and the credits page puts the furni in the redeeming habbo's hand, as HoloCMS did.
status: todo
phase: s5
depends_on: [s5-04]
packages: [packages/store, packages/cms, packages/housekeeping]
client: []
timestamp: 2026-11-11T15:10:47+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-11T15:10:47+00:00"}
---

# Goal

The site gives furni through vouchers, as HoloCMS did ([0095](/decisions/0095-s5-builds-four-site-pieces.md)).

# Steps

- [ ] A voucher names credits or a furni definition; an update, queries, tests and the OKF concepts, with the
  `adding-data-persistence` skill.
- [ ] Housekeeping's Voucher Management makes vouchers of the type Item again, by the furni's sprite name, as
  `source/holocms/housekeeping/vouchers.php` did.
- [ ] The credits page puts the furni in the redeeming habbo's hand, with HoloCMS's texts,
  `You have redeemed this item of furniture successfully.` and `Item not valid, please contact an admin for assistance.`
- [ ] `plans/holo-port/reference/holo-differences.md` loses the difference.

# Verification

```sh
cd packages/store && go vet ./... && go test ./... && make check-docs
cd packages/cms && go test ./... -race
cd packages/housekeeping && go test ./... -race
make gates
```

# Notes

- Runs on the branch `s5-item-vouchers`.
- To settle before it starts:
  - Which furni a sprite name gives when several definitions share it, as the five colours of `bed_budgetb` do; Holo
    took the first.
  - What the credit history shows; Holo wrote a line `Item voucher redeem`.
