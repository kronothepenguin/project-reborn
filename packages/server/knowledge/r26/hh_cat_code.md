---
type: Reference
title: R26 hh_cat_code
description: How the R26 client's catalogue asks for its index and pages, which it reads as text, checks a pet's name, buys a product, as a gift or not, with the extra value its page gives it, and hears of the credit balance, from hh_cat_code's .ls scripts.
timestamp: 2026-11-09T19:03:02+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-09T19:03:02+00:00"}
tags: [r26, protocol]
---

# Scripts

In `packages/client-r26/src/game/hh_cat_code/`, the catalogue's cast. Below, scripts of this cast are named by their
file name, and scripts of other casts by `<cast>/<file>`.

| Script | What it holds |
| --- | --- |
| `3_Catalogue Interface Class.ls` | The catalogue window, the list of pages, a page, and the order and gift dialog; creates the page's script |
| `4_Catalogue Component Class.ls` | Asks for the index and the pages and keeps them, and sends the purchase |
| `5_Catalogue Handler Class.ls` | Registers 7 messages and 3 commands |
| `6_Product Preview Class.ls`, `7_Deal Preview Class.ls`, `8_Catalogue Loader Class.ls` | Draw the products and load the images |
| `9_Catalogue spaces Class.ls` | The page of wallpapers, floors and landscapes; gives their extra value |
| `11_Catalogue trophies Class.ls` | The trophy page; its inscription is the extra value |
| `12_Catalogue pets Class.ls` | The pet page: checks the pet's name, and gives the extra value. Registers 1 message and 1 command in `construct` and unregisters them in `deconstruct` |
| `10_Catalogue plasto Class.ls`, `13_Catalogue pets2 Class.ls`, `14_Catalogue recycler Class.ls`, `15_Catalogue soundmachine Class.ls`, `16_Catalogue purse Class.ls` | Other pages; they send nothing of their own |

A page's layout, the `l` line of 127, chooses its script: `ctlg_<name>` creates `Catalogue <name> Class` when the
cast holds one, and opening another page removes it. So 36 and `APPROVENAME` are registered only while a page laid
out as `ctlg_pets` is open.

Other casts:

| Script | Why it is here |
| --- | --- |
| `hh_room/4_Room Component Class.ls` | The chat command `:editcatalogue`, for holders of `fuse_catalog_editor` (s1-06) |

# Messages from the server

| Id | Handler | Connection | Fields, in order | Notes |
| --- | --- | --- | --- | --- |
| 6 | `handle_purse` (`5_Catalogue Handler Class.ls`) | `#info` | raw: the credits, the first word, read as a number and rounded to an int | Kept in the session as `user_walletbalance`, and executes `#updateCreditCount`. Every 6 after the first plays a cash sound |
| 65 | `handle_purchase_error` (`5_Catalogue Handler Class.ls`) | `#info` | raw: an error text | Only logged |
| 67 | `handle_purchase_ok` (`5_Catalogue Handler Class.ls`) | `#info` | none read | Shows the purchase as done |
| 68 | `handle_purchase_nobalance` (`5_Catalogue Handler Class.ls`) | `#info` | raw, unused | Shows that the credits are not enough |
| 126 | `handle_catalogindex` (`5_Catalogue Handler Class.ls`) | `#info` | raw: one line per page, `<page id>` `TAB` `<page name>` | The answer to `GCIX`. Lines of 3 characters or fewer are skipped. The client then opens the first page |
| 127 | `handle_catalogpage` (`5_Catalogue Handler Class.ls`) | `#info` | raw: lines `<key>:<value>` | The answer to `GCAP` ([A page](#a-page)) |
| 296 | `handle_purchasenotallowed` (`5_Catalogue Handler Class.ls`) | `#info` | int code: 1 `catalog_purchase_not_allowed_hc` | 0 and any other code do nothing |
| 36 | `handle_nameapproved` (`12_Catalogue pets Class.ls`) | `#info` | int result: 0 approved | The answer to `APPROVENAME`, read only while a check waits: 0 opens the order; any other value shows `catalog_pet_unacceptable` |

Raw bodies are split into lines at `RETURN` (`0x0D`) and into values at `TAB`
([fuse_client](/r26/fuse_client.md#booleans-bytes-and-raw-bodies)).

## A page

127's lines each start with a one-character key; a `t` line also has a number before the `:`, `t1:`, `t2:`, which
orders the texts. The value is everything after the first `:`. `<br>` in a text is a line break.

| Key | Value |
| --- | --- |
| `i` | The page id |
| `n` | The page's name |
| `l` | The layout, which also chooses the page's script: `ctlg_spaces`, `ctlg_trophies`, `ctlg_pets` and so on |
| `h` | The header text |
| `g` | The header image |
| `w` | The teaser text |
| `e` | The teaser images, comma-separated; empty ones are skipped |
| `s` | The special teaser text |
| `t<n>` | Text number n |
| `u` | Links, comma-separated |
| `p` | A product, its values `TAB`-separated: name, description, price, special text, object type, class, direction, dimensions, purchase code, part colours; for a deal, then the count of its items and, per item, class, count and part colours |

# Commands from the client

Registered by `5_Catalogue Handler Class.ls` (100 to 102) and `12_Catalogue pets Class.ls` (42). A sender that calls
`send` with text sends it as the whole body, and with a typed list it goes through `sendNew`
([fuse_client](/r26/fuse_client.md#client-to-server)).

| Id | Name | Connection | Sent by | Fields, in order | Notes |
| --- | --- | --- | --- | --- | --- |
| 42 | `APPROVENAME` | `#info` | `12_Catalogue pets Class.ls`: `eventProc`, typed | string pet name; int 1 | Buy on the pet page, before the order; answered by 36 |
| 100 | `GPRC` | `#info` | `4_Catalogue Component Class.ls`: `purchaseProduct`, text | raw: lines ([Buying](#buying)) | OK in the order dialog; answered by 67, 68, 65 or 296 |
| 101 | `GCIX` | `#info` | `4_Catalogue Component Class.ls`: `retrieveCatalogueIndex`, text | raw: `<edit mode>/<language>` | Answered by 126 |
| 102 | `GCAP` | `#info` | `4_Catalogue Component Class.ls`: `retrieveCataloguePage`, text | raw: `<edit mode>/<page id>/<language>` | Answered by 127 |

The edit mode is the variable `ctlg.editmode`, or `production` without it, and the language the variable `language`,
or `en`.

# Flows

## Opening the catalogue

1. The client sends `GCIX`, and 126 lists the pages; it opens the first one with `GCAP`, and each page chosen after it
   the same way.
2. The client keeps the index and each page it got, and asks again only in the edit mode `develop`, which
   `#edit_catalogue` sets.

## Buying

1. Buy opens the order dialog with the product's name and price. The trophy page first takes its inscription, 1 to
   150 characters. The pet page first takes the pet's name, 1 to 15 characters, and sends `APPROVENAME`; only a 36 of
   0 opens the dialog.
2. When the order dialog is the gift one, it also takes the receiver's name, which may not be empty, and a message.
3. OK sends `GPRC`, eight lines, each ended by `RETURN`:
   1. the edit mode;
   2. the page id;
   3. the language;
   4. the product's purchase code;
   5. the extra value of its page, through `convertSpecialChars`, or `-` without one;
   6. 1 for a gift, else 0;
   7. the receiver's name, empty unless a gift;
   8. the message, through `convertSpecialChars`, empty unless a gift.
4. 67 shows the purchase as done, 68 that the credits are not enough, and 296 with 1 shows
   `catalog_purchase_not_allowed_hc`. 65 is only logged. The balance comes as 6.

Extra values:

| Page | Extra value |
| --- | --- |
| Trophies | The inscription |
| Pets | The name, `chr(2)`, the race, `chr(2)`, the colour |
| Spaces, a wallpaper | The pattern's number, then its model in two digits |
| Spaces, a floor | The sixth value of the floor's line in the client's list of floors |
| Spaces, a landscape | `<gradient>.<pattern>` |

# Notes

## Counts

`5_Catalogue Handler Class.ls` registers 7 messages and 3 commands, and `12_Catalogue pets Class.ls` 1 and 1, as
Registering scripts (`packages/client-r26/knowledge/client-r26.md#registering-scripts`) says.

## Ids other casts register too

None: no other cast registers these messages or these commands.

## Dead code

- `purchaseProduct` writes the gift as a single `0` when the dialog gives it no gift value, and the dialog always
  gives one.
- 68's text is never used, and 65's is only logged.

## Quirks

- 296's code 0 has a case label with no statements, so it does nothing, as in
  s1-11's errors.
- The trophy's inscription and the pet's name turn each line break into the two characters `\r`: Lingo strings have
  no escapes.
- `:editcatalogue` executes `"edit_catalogue"`, a string, where the component registered the symbol
  `#edit_catalogue`.
- 6 takes the first word as a number, so `120` and `120.0` give the same balance.
