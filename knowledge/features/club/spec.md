---
type: Spec
title: Club
description: Club is bought on the site and in the client, its gifts are given, and the game shows a player its club at once.
status: planned
projects: [packages/store, packages/server, packages/cms, packages/housekeeping, packages/auth, packages/virtual]
---

# What

A user buys club months on the site's club page from the shared purse, and all its habbos are members. Each purchase
gives the club badge `HC1` to the user's habbos. While the club runs, a member has the wardrobe, the club skins and the
wide home, and in the game the club fuses, the first place in a queue and the club's catalogue pages. The game reads
the club status from the store.

Next:

Club is one feature wherever it is bought or ends ([0010](/decisions/reborn/0010-slices-follow-the-hotels-features.md)).

It builds on [platform](/features/platform/spec.md) and [economy](/features/economy/spec.md).

# Behaviours

## The club page

- A visitor opens `/club`: Holo's club page shows under Credits with its benefits, and a guest is asked to sign in to
  see the club status.
- A signed-in habbo without club opens `/club`: three buy buttons offer 1, 3 and 6 months at `club.price1Month`,
  `club.price3Months` and `club.price6Months`.
- A habbo whose purse holds less than a month's price opens `/club`: Holo's notice leads to the credits page in place
  of the buttons.
- A habbo presses a buy button: Holo's dialog asks first and shows the purse; Cancel buys nothing.
- A habbo buys months: the purse pays, a `club` ledger row is written and a period of `club.daysPerMonth` days a month
  is added, in one transaction.
- A habbo buys during the club: the new period starts at the end of the last one.
- A purchase would pass `club.maxMonths` months, the month under way counted whole: the purchase is refused with
  Holo's words; 0 lifts the limit.
- A purse short of the price: the purchase is refused with Holo's words.
- A guest posts a purchase: the purchase is refused.

## The club badge

- A user buys club: every habbo of the user that lacks `HC1` gets it, archived ones too, and the buyer wears it at once
  in place of the badge it wore (decision holo-port/0103).
- The club ends and a page reads it: `HC1` leaves every habbo of the user, and they keep their other badges (decision
  holo-port/0103).

## Days and perks

- A member opens the Me page, the account pages or `/club`: they count the days to the end of the user's last period.
- A user has several habbos: they all share the club (decision holo-port/0064).
- A visitor opens a club member's home: the playground is 922 pixels wide with no club banner.
- A club member edits its home: the editor offers the club skins.
- A member opens Looks: the wardrobe keeps up to `homes.wardrobeSlots` outfits for each habbo, and a green arrow puts
  an outfit in the editor.
- A habbo without club, a bad slot or a bad look posts to the wardrobe: the outfit is refused.
- The club ends: its days, skins, wide playground and wardrobe go.
- Staff save housekeeping's Club form: the prices and the days of a month change; `HC Months Limit`, among the
  content options, sets the month limit.

## In the game

- A habbo asks its club status in the client: message 7 gives the days of the running period, the prepaid periods
  and the elapsed periods, by `club.daysPerMonth` (decision server/0052).
- A member logs in: it holds the club dance, the special room layouts and the habbo and furni choosers while the club
  runs (decision server/0045).
- A habbo without club creates a room of a club model: the room is refused.
- A full room has a queue: club members enter first (decision server/0088).
- A member opens the catalogue: Greek and Advertisement show to it (decision server/0100).
- A habbo without club buys from Club Furni or Club Shop: it gets 296 with 1 and pays nothing (decision server/0102).

# Open questions

- From the server's phase S7, as written there: "How club bought in the client meets club bought
  on the site (the port's phase P6). The client's `SCR_BUY` sends which of its three buttons was
  pressed, 1 to 3, not a number of months".
- What of club's gifts is saved.
