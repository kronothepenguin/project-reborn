---
type: Task
title: Store vouchers, club purchases and wardrobe outfits
description: The store gains the voucher operations from creating to redeeming once, the club's latest end and periods, the club badge for every habbo of a user, and the wardrobe's outfits per habbo, with their entities documented.
status: todo
phase: p6
depends_on: []
packages: [packages/store]
holo: [source/holocms/redeemvoucher.php, source/holocms/club_subscribe.php, source/holocms/core.php, source/holocms/wardrobestore.php, source/holocms/housekeeping/vouchers.php]
timestamp: 2026-11-06T22:30:17+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-06T22:30:17+00:00"}
---

# Goal

The CMS and housekeeping read and write vouchers, club periods, club badges and outfits through tested queries
([0056](/decisions/0056-wallet-club-and-inventory-per-user.md), [0063](/decisions/0063-what-housekeeping-can-delete.md),
[0103](/decisions/0103-club-badge-for-every-habbo.md)).

# Steps

- [ ] Vouchers: create one, list the unused ones in the order they were made, delete an unused one only, and redeem
  one: a single statement claims an unused code, ignoring case, for the habbo and returns its credits, so that two
  redemptions of one code give credits once.
- [ ] Club: the latest end of a user's periods, whether a user has any period, and a new period. The caller starts a
  period at the later of now and that end.
- [ ] Club badge: give `HC1`, unworn, to every habbo of a user that lacks it, and take `HC1` from every habbo of a
  user. Wearing it is the existing take-off and wear.
- [ ] Wardrobe: a habbo's outfits by slot, and saving an outfit in a slot over the one there.
- [ ] The voucher, club subscription and wardrobe outfit entities' docs, and the queries' docs.
- [ ] Store tests: a code redeems once, ignoring case; a redeemed voucher is not deleted; a period starts at the end of
  the current one; `HC1` reaches every habbo of the user and no other user's; an outfit replaces its slot's.

# Verification

```sh
cd packages/store && go tool sqlc diff && gofmt -l . && go vet ./... && go test -race ./... && make check-docs
```

# Notes

- `vouchers`, `club_subscriptions` and `wardrobe_outfits` are already in the schema from P0.
- `GrantAvatarBadge` wears what it grants, so the badge for every habbo needs its own unworn insert.
