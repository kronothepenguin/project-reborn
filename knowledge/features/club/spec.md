---
type: Spec
title: Club
description: Club is bought on the site and in the client, its gifts are given, and the game shows a player its club at once.
status: active
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

- A new hotel: 1, 3 and 6 months cost 20, 50 and 80 credits, a month is 31 days, a purchase reaches at most 6 months,
  and the wardrobe holds 5 outfits.
- A visitor opens `/club`: Holo's club page shows under Credits with its benefits, and a guest is asked to sign in to
  see the club status.
- A signed-in habbo without club opens `/club`: three buy buttons offer 1, 3 and 6 months at `club.price1Month`,
  `club.price3Months` and `club.price6Months`.
- A habbo whose purse holds less than a month's price opens `/club`: Holo's notice leads to the credits page in place
  of the buttons.
- A habbo presses a buy button: Holo's dialog asks first and shows the purse; Cancel buys nothing.
- A habbo buys months, then presses another buy button: the dialog counts the purse after the purchase, without a
  reload.
- A habbo buys months: the purse pays, a `club` ledger row is written and a period of `club.daysPerMonth` days a month
  is added, in one transaction.
- A habbo asks for a number of months other than 1, 3 or 6: one month is bought.
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
- A user with no club period wears `HC1` that staff gave: the badge stays.

## Days and perks

- A member opens the Me page, the account pages or `/club`: they count the days to the end of the user's last period.
- A user has several habbos: they all share the club (decision holo-port/0064).
- A visitor opens a club member's home: the playground is 922 pixels wide with no club banner.
- A club member edits its home: the editor offers the club skins.
- A member opens Looks: the wardrobe keeps up to `homes.wardrobeSlots` outfits for each habbo, and a green arrow puts
  an outfit in the editor.
- A member hovers over the wardrobe: Holo's instructions show the number of slots, and leaving hides them.
- A member presses a red arrow over a stored outfit: Holo's question asks first; Cancel keeps the outfit, and OK
  replaces it.
- A member presses a green arrow: the outfit the editor already shows changes nothing, and one pressed while the editor
  loads is applied once the editor has drawn.
- A habbo without club, a bad slot or a bad look posts to the wardrobe: the outfit is refused.
- A habbo without the club opens Looks: a Join box shows in place of the wardrobe.
- The club ends: its days, skins, wide playground and wardrobe go.
- Staff save housekeeping's Club form: the prices and the days of a month change; `HC Months Limit`, among the
  content options, sets the month limit.
- Staff save a club price, the days of a month, the months limit or the wardrobe slots outside its bounds: the value is
  refused.

## In the game

- A habbo asks its club status in the client: message 7 gives the days of the running period, the prepaid periods
  and the elapsed periods, by `club.daysPerMonth` (decision server/0052).
- A member logs in: it holds the club dance, the special room layouts and the habbo and furni choosers while the club
  runs (decision server/0045).
- A habbo without club creates a room of a club model: the room is refused.
- A full room has a queue: club members enter first (decision server/0088).
- A member opens the catalogue: Greek and Advertisement show to it (decision server/0100).
- A habbo without club buys from Club Furni or Club Shop: it gets 296 with 1 and pays nothing (decision server/0102).

## Next

### Club bought in the client

- A habbo opens the client's club window and presses its first, second or third button: it buys 1, 3 or 6 months, at
  the site's prices, from the purse its user's habbos share.
- A habbo buys months in the client: the club page's rules hold: the period starts where the last one ends, the `HC1`
  badge goes to the user's habbos, and the ledger gets its row.
- A habbo buys months in the client: its client shows the new credits and the club's days at once, and its club
  rights hold from then on.
- A habbo with too few credits presses a button: the client shows its "not enough credits" notice, and nothing is
  bought.
- A habbo whose club would pass the limit of months presses a button: the client shows its "could not extend" notice,
  and nothing is bought.

### The club's gifts

- A user has been a club member for a full month more: one gift more waits for it.
- A habbo with gifts waiting logs in: its client offers them one by one, and each one accepted lands in its hand.
- Staff set the order of the gifts in housekeeping, by drag and drop, each gift shown with its name and its picture.

# Open questions

- What comes after the last gift of the list, and when a month counts: after the study of the real club's
  gifts, `research-gifts.md` in this folder, which is being written.
