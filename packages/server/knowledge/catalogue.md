---
type: Reference
title: The catalogue
description: The hh_cat_code commands the server answers: the index, the pages, purchases and presents.
tags: [server]
---

`cat_code.go` serves hh_cat_code once the habbo is logged in, from the shared
data of `virtual/catalogue` ([hh_cat_code](/r26/hh_cat_code.md)):

| Command | Answer |
| --- | --- |
| `GCIX` (101) | 126: the pages the habbo sees, in the catalogue's order, a line each: the page's code, a tab and its name. A habbo sees a page when its access group level reaches the page's, or when the page is open to the club and its user is a member (`knowledge/decisions/server/0100-sixteen-pages-need-level-7-and-two-the-club.md`) |
| `GPRC` (100) | 67 and 6 with the new balance: the item of the page, both named by their codes, is bought with the credits of the habbo's user, and its furni lands in the habbo's hand. 68 when the credits are not enough; 296 with 1 when the page sells only to club members and the habbo's user is not one (`knowledge/decisions/server/0102-club-furni-and-club-shop-sell-to-club-members.md`); 65 when the page does not exist, the habbo does not see it or it sells no such item. None of the three charges |
| `GCAP` (102) | 127: the page the client names by its code, a line per value: `i` the code, `n` the name, `l` the layout, then those the page has of `g`, `e`, `h`, `w` and `s`, its numbered texts as `t<n>`, and a `p` line for each item it sells. A page that does not exist or that the habbo does not see gets no answer |

- The client names a page by its code and reads the page `Recycler` by that
  name, so the code is Holo's index name, and a page's name is what the list
  shows: `Recycler` is listed as Ecotron.
- A `p` line's values are separated by tabs: name, description, price, an
  empty special text, the object type, the class, the direction, the
  dimensions, the purchase code and the part colours. A floor furni is `s`,
  with direction 0 and its length and width; a wall item is `i`, its class the
  sprite and, after a space, its data, as in `poster 44`; a deal, an item that
  gives more than one piece, is `d`, followed by the count of its furni and
  each one's class, pieces and colours.
- A teleport, `door`, `doorB`, `doorC`, `doorD` or `teleport_door`, comes as two furni
  that name each other, as Holo sold it; in a present, both wait in the box.
- The purchase code is the item's own code, which `GPRC` sends back. The
  client shows the picture `ctlg_pic_<code>` when its cast holds one, as it
  does for the pet food packs, `deal97` to `deal99`.
- A purchase is one transaction: the wallet pays, its history gets the line
  `Catalogue purchase (<item>)` under the reason `catalogue`, and each piece
  the item gives becomes a furni in the buyer's hand, six for a pet food pack.
  The wallet belongs to the user, so every habbo of the user pays from it.
- A furni bought on a page of the layout `ctlg_trophies` keeps the buyer's
  name, the day as dd-mm-yyyy and the inscription, cut at 150 characters,
  separated by tabs, as the client's trophy reads its state. One bought on the
  `ctlg_spaces` page keeps the pattern the client sends, digits with at most
  one dot. A pad of post-its starts with 20 notes.
- After 67 the client shows the purchase as done and, in a habbo room, opens
  the hand by itself, which asks for it with `GETSTRIP`.
- A gift, the order's sixth line 1, buys for the habbo its seventh line
  names, online or not
  (`knowledge/decisions/server/0094-any-habbo-sends-a-present-to-any-habbo.md`):
  the furni waits in one of the six boxes, `present_gen1` to `present_gen6`,
  drawn at random, in the receiver's hand, and belongs to the receiver's user.
  The box's state is `!` and the note, its control characters turned into
  spaces and cut at `game.presentNoteMaxLength`, 200. The buyer pays, and its
  history's line ends with `, a present for <name>`. A name that no habbo has
  gets 76 with the name and charges nothing. A receiver that is in a room gets
  101, on which its client asks for its hand.
- The edit mode and the language the client sends change nothing. A tab, a
  line break or another control character in a value becomes a space.
- The level and the club are read from the store each time, since the site
  changes them; the client keeps the index and each page for the session.
