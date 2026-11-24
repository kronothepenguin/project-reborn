---
type: Spec
title: Economy
description: Housekeeping changes credits, tickets and film, the site shows them and spends them in vouchers and purchases, and the game server shows a player its new balance at once.
status: active
projects: [packages/store, packages/server, packages/cms, packages/housekeeping, packages/auth, packages/virtual]
---

# What

A user has one purse of credits, which all its habbos share, and a new user starts with the start credits. The site
shows the purse on the credits page, redeems credit and item vouchers, and lists the user's transactions.
Housekeeping gives and takes credits, reads a user's ledger and manages vouchers. The game reads the purse when the
client asks.

Next:

Credits, tickets and film are one feature wherever they change
([0010](/decisions/reborn/0010-slices-follow-the-hotels-features.md)).

The user: "credits: housekeeping allow modify credits, cms show credits and allow to spend them and server manages."
And: "what if we make an "economy" slice better, and include everything about economy there?"

It builds on [platform](/features/platform/spec.md) and [habbos](/features/habbos/spec.md).

# Behaviours

## The credits page

- Anyone opens the Credits page, Account transactions and housekeeping's Vouchers page: Holo's title, headings, labels
  and columns show, with the tab or menu place marked.
- A visitor opens `/credits`: Holo's two boxes show in BBCode beside their pictures, and a guest is told to sign in to
  see the purse (decision holo-port/0105).
- A visitor opens `/credits`: the green box stands in the first column, and the purse above the blue box in the second.
- A signed-in habbo opens `/credits`: the purse shows the balance all the user's habbos share, the link to the
  transactions and the code field (decision holo-port/0064).
- A habbo redeems a credit voucher: its credits reach the purse with a ledger row for the active habbo, and the voucher
  is kept as redeemed, in one transaction.
- A habbo redeems a code: the purse shows the new balance and Holo's answer, green on success, in place of the field,
  without a reload.
- A habbo types a code in another case or with spaces after it: the voucher redeems, as Holo's MySQL found it.
- A habbo types a used or unknown code: Holo's "Your redeem code could not be found." shows in red, and the purse and
  the ledger stay as they were.
- A habbo redeems an item voucher: the active habbo's hand gets what buying the furni gives, and the ledger gets
  `Item voucher redeem (<furni name>)` with 0 credits (decisions server/0121, server/0125).
- A signed-in habbo opens `/credits/transactions`: the 50 newest rows of the user's ledger show with Holo's Date,
  Activity and Description and the habbo that acted (decision holo-port/0104).
- A guest opens `/credits/transactions`: it is sent to sign in.

## Start credits

- A visitor registers: the new user's purse starts with `registration.startCredits`, with a ledger row
  `Welcome to <site name>!`; with 0 start credits, no row is written.
- A user adds a habbo: the habbo shares the user's purse and brings no start credits (decision holo-port/0064).

## Housekeeping

- Staff with `housekeeping.credits` give or take credits on a habbo of a user below them: the purse, the ledger and
  the staff log change together.
- Staff take more than the purse holds, or type an amount that is no whole number: Holo's
  "Amount is not valid or this user does not exist!" shows, and nothing changes.
- Staff with `housekeeping.credits` open a habbo's transactions: its user's ledger shows, 100 rows a page, with the
  habbo of each row.
- Staff open the transactions of a habbo whose user has none: the ledger is empty.
- Staff read the credit history and the staff log: every row stays as it was written (decision holo-port/0063).
- Staff with `housekeeping.vouchers` open Vouchers: Create Voucher offers a random code of 8 of Holo's characters, and
  the list shows the unused vouchers.
- A Moderator opens Vouchers: they create and delete vouchers.
- Staff create a credit voucher: it is saved with its credits and its creator, unused, and the log keeps it.
- Staff leave a field blank, type an amount outside 1 to 2147483647, a code over 20 characters or a code a voucher has
  in any case: the voucher is refused with 422, and the form keeps what was typed.
- Staff create a voucher with the code `.` or `..`: the voucher is refused with
  "The redemption code cannot be . or .." (decision holo-port/0106).
- Staff create an item voucher by a sprite name: it gives the furni of that sprite with the lowest id; a name that
  matches no furni, a wallpaper, a floor or a landscape is refused (decisions server/0120, server/0125).
- Staff delete an unused voucher: it goes, whatever its code holds; a voucher redeemed meanwhile stays, and the answer
  is 404 (decision holo-port/0063).
- Staff without `housekeeping.vouchers` open Vouchers: they get Access Denied.
- Staff save the Credits Page settings: the headings and BBCode bodies of the two boxes change on `/credits`.
- Staff save a Credits Page box outside its bounds: the value is refused.

## The game

- A habbo asks its credits in the client: the answer is the purse's balance, read from the store (decision
  server/0053).
- Credits change on the site: the game shows them at the habbo's next purchase or login.

## Next

### The purse, live

- The site or housekeeping changes a user's purse while one of its habbos is in the hotel: the habbo's client shows
  the new credits, tickets and film at once.
- The purse of a user with no habbo in the hotel changes: nothing is sent, and the habbo reads it at its next login.
- The game gives no answer: the purse is changed all the same, and the page answers as it does without the game.

### Tickets and film in housekeeping

- Staff with `housekeeping.credits` give or take tickets on a habbo of a user below them: the purse and the staff log
  change together, and the client shows the tickets at once.
- Staff with `housekeeping.credits` give or take film on a habbo of a user below them: the purse and the staff log
  change together, and the client shows the film at once.
- Staff take more tickets or film than the purse holds, or type an amount that is no whole number: the form is
  refused, and nothing changes.
