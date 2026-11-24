---
type: Plan
title: "Club: how"
description: The site and the game sell club, and the game shows a player its club at once.
---

# Architecture

Built:

| Project | Part |
| --- | --- |
| `packages/store` | `club_subscriptions`, the user's periods; `wardrobe_outfits`; `HC1` given to and taken from the user's habbos |
| `packages/cms` | `/club` and `POST /club/subscriptions`; the club days on the Me and account pages; the wardrobe on Looks; the club skins and wide home |
| `packages/housekeeping` | The Club settings form and `homes.wardrobeSlots` |
| `packages/virtual` | The settings `club.*` and `homes.wardrobeSlots` |
| `packages/auth` | The four club fuses while the club runs |
| `packages/server` | The club status (message 7), club models, the club line of a queue, the club's catalogue pages |

Planned:

| Project | Part |
| --- | --- |
| `packages/cms` | Sells club; tells the game |
| `packages/server` | Sends a player its club and its rights at once; sells club and its gifts in the client (`hh_club`, `packages/server/knowledge/r26/hh_club.md`) |
| `packages/store` | What club bought in the client needs |

## Buying, shared by the site and the game

The shape the user approved on 2026-11-24:

```go
// packages/virtual/club

// Buy buys months of club for the user from its purse,
// in the caller's transaction: the debit, its ledger
// row, the period and the HC1 badge of its habbos.
func Buy(ctx context.Context, q *store.Queries,
    userID, avatarID int64, months int,
    now time.Time) (Result, error)

type Result struct {
    Refused   Reason // none, too few credits, over the limit
    Days      int    // days of club left after the purchase
    Credits   int64  // the purse after the purchase
    MaxMonths int    // the limit, when it refused
}
```

- The site's club page and the game's answer to the client's `SCR_BUY` both call it.
- The client's buttons 1, 2 and 3 buy 1, 3 and 6 months at `club.price1Month`, `club.price3Months` and
  `club.price6Months`.

# Decisions

Of 2026-11-24, each the user's choice among options put to them:

- The client's three buttons are the site's three offers ("The site's three offers"). It answers the open question of
  the server's phase S7.
- The rule of a purchase lives in `packages/virtual/club`, beside `packages/virtual/furni` ("packages/virtual/club").
- One gift waits for each full month of club, offered at login and landing in the habbo's hand. The user: "as
  recommended, but instead of following club furni page order, create an interface in the housekeeping that allows
  drag and drop to reorder furnis with name an maybe an image of the furni. please also make a research of what to
  expect after a year of habbo club, do the list restart or give more furnis?" The gifts' tasks follow the study.

Earlier:

- [Slices follow the hotel's own features, and habbos comes
  first](/decisions/reborn/0010-slices-follow-the-hotels-features.md) — The economy and club are separate slices, furni
  with its catalogue is furnis, friends is the messenger, and habbos, rooms and navigator are slices of their own; the
  habbos slice is the first feature built, end to end from the site to the client.
- [Home backgrounds are unlocks](/decisions/holo-port/0064-backgrounds-are-unlocks.md) — Supersedes 0056 and keeps its
  rest: the club belongs to the user, so all its habbos are members.
- [Every habbo of a club member gets the club badge](/decisions/holo-port/0103-club-badge-for-every-habbo.md) — Each
  purchase gives `HC1` to every habbo that lacks it, the buyer wears it, and it leaves them all when the club ends.
- [A habbo's fuses: everyone's two, Holo's club set, and every checked fuse from access
  groups](/decisions/server/0045-fuses-holos-club-set-and-every-checked-fuse.md) — A club member also gets the club
  dance, the special room layouts and the habbo and furni choosers.
- [The club status splits the club's days by
  club.daysPerMonth](/decisions/server/0052-club-status-by-days-per-month.md) — Message 7 gives the days of the running
  period, the prepaid periods and the elapsed periods, with response 1.
- [Club members come first in a queue](/decisions/server/0088-club-members-first-in-a-queue.md) — A room's queue holds
  a club line and a line for everyone else, and a place goes to the club line first.
- [Sixteen catalogue pages need level 7, and two the
  club](/decisions/server/0100-sixteen-pages-need-level-7-and-two-the-club.md) — Greek and Advertisement show to club
  members and to staff from level 2.
- [Club Furni and Club Shop sell only to club
  members](/decisions/server/0102-club-furni-and-club-shop-sell-to-club-members.md) — Everyone sees the two pages; anyone
  else gets 296 with 1 and pays nothing.

# Notes

- The labels and help of the `Club` form and of `Wardrobe Slots` are ours, since Holo wrote those numbers in its code.
  `HC Months Limit` keeps Holo's help.
- The month limit counts the days left, a day begun among them, in months of `club.daysPerMonth`, the month under way
  as a whole one, as Holo's `months_left`: with a limit of 6 and months of 31 days, 114 days left take 1 more month but
  not 3, and 93 days take 3 but 94 do not. The purse is checked first, as Holo did.
- The wardrobe stands at the editor's right as a column of 67-pixel slots, 46 pixels below the editor's top, as Holo's
  style placed it. Its instructions bubble stands 585 pixels from the left of the 930-pixel content, 95 pixels left of
  the slots.
