---
type: Task
title: Store vouchers, club purchases and wardrobe outfits
description: The store gains the voucher operations from creating to redeeming once, the club's latest end and periods, the club badge for every habbo of a user, and the wardrobe's outfits per habbo, with their entities documented.
status: done
phase: p6
depends_on: []
packages: [packages/store]
holo: [source/holocms/redeemvoucher.php, source/holocms/club_subscribe.php, source/holocms/core.php, source/holocms/wardrobestore.php, source/holocms/housekeeping/vouchers.php]
timestamp: 2026-11-06T23:04:20+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-06T22:30:17+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-06T23:04:20+00:00"}
---

# Goal

The CMS and housekeeping read and write vouchers, club periods, club badges and outfits through tested queries
([0056](/decisions/0056-wallet-club-and-inventory-per-user.md), [0063](/decisions/0063-what-housekeeping-can-delete.md),
[0103](/decisions/0103-club-badge-for-every-habbo.md)).

# Steps

- [x] Vouchers: create one, list the unused ones in the order they were made, delete an unused one only, and redeem
  one: a single statement claims an unused code, ignoring case, for the habbo and returns its credits, so that two
  redemptions of one code give credits once.
- [x] Club: the latest end of a user's periods, whether a user has any period, and a new period. The caller starts a
  period at the later of now and that end.
- [x] Club badge: give `HC1`, unworn, to every habbo of a user that lacks it, and take `HC1` from every habbo of a
  user. Wearing it is the existing take-off and wear.
- [x] Wardrobe: a habbo's outfits by slot, and saving an outfit in a slot over the one there.
- [x] The voucher, club subscription and wardrobe outfit entities' docs, and the queries' docs.
- [x] Store tests: a code redeems once, ignoring case; a redeemed voucher is not deleted; a period starts at the end of
  the current one; `HC1` reaches every habbo of the user and no other user's; an outfit replaces its slot's.

# Verification

```sh
cd packages/store && go tool sqlc diff && gofmt -l . && go vet ./... && go test -race ./... && make check-docs
```

Results (2026-11-06T23:04:20+00:00):

- `go tool sqlc diff`, `gofmt`, `go vet`, `go test -race` and `make check-docs` pass in `packages/store`.
- The store tests:
  - `abcd1234` redeems `AbCd1234` for its 50 credits, which the purse gains in the same transaction; `ABCD1234` and
    an unknown code then find nothing, so the purse holds 150, and the voucher keeps the habbo and the time and leaves
    the unused list;
  - the unused vouchers list in the order they were made, not by code; a second code in other case conflicts;
    deleting the redeemed voucher touches nothing and keeps it, and deleting an unused one in other case removes it;
  - a period bought 10 days into a month starts at that month's end, so the club ends 124 days after the first
    purchase, and one bought after the club ended starts at once; another user's periods count neither for the end
    nor for whether the user has any;
  - `HC1` reaches the 3 habbos of the user that lacked it, the archived one among them, unworn, while the buyer still
    wears `ADM`; the habbo that held it keeps it as it was, and the other user's habbo gets nothing. The buyer then
    wears it with `TakeOffAvatarBadge` and `WearAvatarBadge`, and a second purchase gives it to no one. Taking it
    removes it from all 4 habbos of the user, leaving `ADM` and the other user's `HC1`;
  - an outfit replaces its slot's, the outfits list by slot, another habbo of the user keeps its own, and slot 0 is
    refused.
- Breaking the queries on purpose fails a test, 19 of 19, each in its own test: a redemption without the unused check
  or matching case; a delete of a redeemed voucher; redeemed vouchers listed, or listed by code; the earliest end or
  any user's periods for the latest end, and any user's periods for whether one has any; `HC1` worn, given to any
  user's habbos, left off archived habbos or given again to a holder; any badge, any user's or not the archived
  habbos' taken; outfits listed by slot backwards or every habbo's; and an outfit, or its gender, kept over a new one.

# Notes

- `vouchers`, `club_subscriptions` and `wardrobe_outfits` are already in the schema from P0.
- `GrantAvatarBadge` wears what it grants, so the badge for every habbo needs its own unworn insert.
- Every habbo of the user includes archived habbos, which are still the user's
  ([0058](/decisions/0058-habbos-are-archived.md), whose rules [0089](/decisions/0089-archived-habbos-show-as-archived.md)
  keeps): `GrantBadgeToUserAvatars` gives them `HC1` and `DeleteBadgeFromUserAvatars` takes it from them.
- The voucher and the wardrobe outfit are entities of their own, taking `vouchers` from the wallet entity and
  `wardrobe_outfits` from the habbo entity.
- `RedeemVoucher` takes its time as a nullable parameter, as `EditForumPost` does: the column is nullable, and a time
  is never cast. sqlc types `GrantBadgeToUserAvatars`'s select list from the columns it fills, so its code and time
  need no cast.
- `GetClubEnd` gives the end of the period that covers now, so after a purchase made during the club the days left
  would stop at the running period's end: [p6-09](/tasks/p6-09-club-days-to-the-last-period.md).
