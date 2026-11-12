---
type: Task
title: Redeem item vouchers on the site
description: A voucher gives credits or a furni; housekeeping's Voucher Management makes item vouchers by sprite name, and the credits page puts the furni in the redeeming habbo's hand, as HoloCMS did.
status: done
phase: s5
depends_on: [s5-04]
packages: [packages/store, packages/cms, packages/housekeeping]
client: []
timestamp: 2026-11-12T15:45:29+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-11T15:10:47+00:00"}
verified:
  - {by: claude-code/claude-fable-5-2, at: "2026-11-12T15:45:29+00:00"}
---

# Goal

The site gives furni through vouchers, as HoloCMS did ([0095](/decisions/0095-s5-builds-four-site-pieces.md)).

# Steps

- [x] A voucher names credits or a furni definition; an update, queries, tests and the OKF concepts, with the
  `adding-data-persistence` skill.
- [x] Housekeeping's Voucher Management makes vouchers of the type Item again, by the furni's sprite name, as
  `source/holocms/housekeeping/vouchers.php` did.
- [x] The credits page puts the furni in the redeeming habbo's hand, with HoloCMS's texts,
  `You have redeemed this item of furniture successfully.` and `Item not valid, please contact an admin for assistance.`
- [x] `plans/holo-port/reference/holo-differences.md` loses the difference.

# Verification

```sh
cd packages/store && go vet ./... && go test ./... && make check-docs
cd packages/cms && go test ./... -race
cd packages/housekeeping && go test ./... -race
make gates
```

Results:

- The store's `vouchers` is rebuilt by the update `0021-item-vouchers.sql`: a voucher gives credits or the furni of
  `furni_definition_id`, never both and never neither. `CreateVoucher`, `ListUnusedVouchers` and `RedeemVoucher` carry
  the furni, and `catalogue.query.sql` gained `GetFurniDefinition`, `GetFurniDefinitionBySprite` and `GetFurniName`.
- Housekeeping's Voucher Management has HoloCMS's `Type` list and its `Amount` help again. An Item voucher is made by a
  sprite name and gets the first furni of it
  ([0120](/decisions/0120-an-item-voucher-gives-the-first-furni-of-its-sprite.md)); an unknown name, and a wallpaper, a
  floor or a landscape, are refused.
- The credits page answers an item voucher with `You have redeemed this item of furniture successfully.`, puts the furni
  in the active habbo's hand and writes `Item voucher redeem (<name>)` with 0 credits in the history
  ([0121](/decisions/0121-an-item-voucher-leaves-a-line-of-no-credits.md)), in the transaction that claims the code.
- `packages/virtual/furni` gained `Create`, which gives a furni its pieces, a teleport's pair and a pad's 20 notes; the
  game server's buying calls it, and so does the site
  ([0125](/decisions/0125-an-item-voucher-gives-what-buying-gives.md)).
- `plans/holo-port/reference/holo-differences.md` loses the two differences that said item vouchers wait, and gains what
  the port does differently with them.
- In `packages/store`, `go vet ./...`, `go test ./...` and `make check-docs` pass, with
  `TestAVoucherGivesCreditsOrAFurni`. `go test ./... -race` passes in `packages/cms`, with
  `TestRedeemingAnItemVoucherFillsTheHand`, in `packages/housekeeping`, with `TestCreatingAnItemVoucher`, and in
  `packages/server`. `make gates` passes.

# Notes

- Runs on the branch `s5-item-vouchers`.
- Settled before it started: an item voucher gives the first furni of its sprite, found when the voucher is made
  ([0120](/decisions/0120-an-item-voucher-gives-the-first-furni-of-its-sprite.md)), leaves a line of 0 credits in the
  credit history ([0121](/decisions/0121-an-item-voucher-leaves-a-line-of-no-credits.md)), and gives what buying the
  furni gives ([0125](/decisions/0125-an-item-voucher-gives-what-buying-gives.md)).
- Chosen without asking: housekeeping's two new answers, `Unable to create voucher; this item does not exist!` and
  `Unable to create voucher; wallpapers, floors and landscapes cannot be given by a voucher!`, in the words of its page;
  its staff log's `Created voucher <code> for the item <name>`; the list of vouchers shows the sprite where the credits
  go, as Holo's column did; the history's line names the furni as the catalogue sells it, or by its sprite when no item
  sells it alone.
- HoloCMS's `Item not valid, please contact an admin for assistance.` is never shown: the furni is found when the
  voucher is made, so the step that asked for the text is done by the difference recorded in
  `plans/holo-port/reference/holo-differences.md`.
