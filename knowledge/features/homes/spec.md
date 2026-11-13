---
type: Spec
title: Homes
description: Every habbo has a home page that guests read and its owner decorates with stickers, notes, widgets and backgrounds bought in the Webstore.
status: done
projects: [packages/cms, packages/store, packages/housekeeping, packages/components]
---

# What

Every habbo has a home at `/home/{name}`. Guests read it. Its owner decorates it in the home editor with stickers,
notes, widgets and a background. The items come from the Webstore and wait in the inventory. Staff manage the store's
items in housekeeping. The art ships inside the CMS.

# Behaviours

## Reading a home

- A guest opens a habbo's home: the stickers, notes and widgets show, with no Edit (decision holo-port/0017).
- A visitor opens the home of an unknown habbo: Holo's `Page not found!` page shows.
- A home holds a note: the note shows its BBCode formatted and its HTML escaped.
- A home of a user without the club: the playground is 752 pixels wide, beside the club banner.
- A home of a club member: the playground is 922 pixels wide, with no club banner.
- The active habbo's home shows under Me as `My Page`; every other home shows under Community.
- A visitor opens a picture of the home art: the CMS binary serves it (decision holo-port/0061).

## Editing a home

- A user opens Edit on the home of any habbo they own: the home editor opens, whichever habbo is active
  (decision holo-port/0065).
- A user opens another user's home: the home shows with no Edit.
- The owner drags, re-skins and removes items and saves: the home keeps the new places, skins and background.
- The owner drops an item off the playground: the item goes back to its place.
- The owner removes the profile widget: the widget stays on the home.
- A habbo picks a club skin: it takes an active club membership.
- A habbo picks the staff skin or opens the staff category: it takes `homes.staffItems`.
- The owner places more than `homes.maxItems` items, 200 by default: the save is refused.
- The owner removes a sticker: the sticker goes back to the inventory.
- The owner removes a note: the menu warns first, and the note is deleted for good (decision holo-port/0098).
- The Widgets tab of a habbo's home offers My Groups alone.
- A habbo's name holds `?`: Edit opens its editor, and Cancel goes back to its home.

## Notes

- A habbo writes a note: the BBCode editor shows it as it will look, with the site's look and the smilies
  (decision holo-port/0092).
- A habbo types a note: the counter counts its BBCode, up to `homes.noteMaxLength`, 500 by default.

## Webstore and inventory

- A habbo opens the Webstore: it shows each item's price and the habbo's credits.
- A habbo buys an item: the store asks first in Holo's words, then takes the credits and adds the item to the
  inventory, with a ledger row in the same transaction.
- A habbo without enough credits buys an item: the purchase is refused, and the credits and the inventory stay.
- A user buys a background: every home of the user's habbos can show it, and a second copy is refused
  (decision holo-port/0064).
- Stickers, notes and backgrounds not placed on a home belong to the user, shared by all their habbos
  (decision holo-port/0064).
- A user archives a habbo: the stickers and notes of its own home go back to the inventory, and what it placed on
  group homes stays there (decision holo-port/0096).

## The store in housekeeping

- A new hotel is installed with Holo's home store.
- Staff with `housekeeping.homeStore` add an item from the art: it is listed as typed, with a preview from the CMS.
- Staff edit an item or stop selling it: the change is saved, and the item stays listed.
- Staff save a bad price: the answer is 422, with the reason and the row as typed.
- The store lists 100 items a page.
- Staff add or edit an item: the staff log holds the change and who made it.
- Staff without `housekeeping.homeStore` open the store: Access Denied.
