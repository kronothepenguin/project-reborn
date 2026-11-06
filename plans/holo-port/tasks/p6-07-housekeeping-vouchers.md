---
type: Task
title: Manage vouchers in housekeeping
description: Housekeeping's Voucher Management creates credit vouchers with Holo's random code, lists the unused ones and deletes an unused one, each logged, for holders of housekeeping.vouchers.
status: todo
phase: p6
depends_on: [p6-02]
packages: [packages/housekeeping, tests/e2e]
holo: [source/holocms/housekeeping/vouchers.php, source/holocms/housekeeping/usermenu.php]
timestamp: 2026-11-06T22:30:17+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-06T22:30:17+00:00"}
---

# Goal

Staff make the credit vouchers that habbos redeem ([0063](/decisions/0063-what-housekeeping-can-delete.md)).

# Steps

- [ ] `Voucher Management` in the menu, where Holo's `usermenu.php` has it, for holders of `housekeeping.vouchers`.
- [ ] `GET /housekeeping/vouchers` lays out Holo's page: `Create Voucher` with `Redemption Code`, filled with a random
  code of 8 of Holo's characters drawn with `crypto/rand`, and `Amount`, with Holo's help texts; and
  `Existing vouchers` with each unused voucher's code and credits. Holo's `Type` list goes, since vouchers give
  credits only.
- [ ] `POST /housekeeping/vouchers` creates the voucher: `Please do not leave any fields blank.` for a blank field, a
  whole number from 1 to 2147483647 as `Give Credits` takes, a code of at most 20 characters that no voucher has, and
  `The voucher has been created successfully.` The staff log reads `Created voucher <code> worth <credits> credits`.
- [ ] `POST /housekeeping/vouchers/{code}/delete` deletes an unused voucher, with a staff log row; a redeemed one stays.
- [ ] Router tests, and a `housekeeping-vouchers` browser suite: create, the list, a blank field, a taken code, a
  delete, and a staff member without the access.
- [ ] The differences in [Holo's differences](/reference/holo-differences.md): credit vouchers only, deletion, the
  checks on the amount and the code.

# Verification

```sh
# gofmt, go vet and go test -race in packages/housekeeping; pnpm check in packages/housekeeping
cd tests/e2e && node run.mjs housekeeping-vouchers
```

# Notes

- Housekeeping keeps Holo's spelling, `recieve` among it.
- Holo's characters leave out `c`, and repeat the digits.
