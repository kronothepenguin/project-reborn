---
type: Task
title: Buy club on the club page
description: GET /club shows Holo's club page and membership box, whose buttons open Holo's confirm and result dialogs and buy club months from the shared purse in one transaction, with the club badge for every habbo of the user.
status: done
phase: p6
depends_on: [p6-01, p6-02]
packages: [packages/cms, tests/e2e]
holo: [source/holocms/club.php, source/holocms/club_confirm.php, source/holocms/club_subscribe.php, source/holocms/ajax_club.php, source/holocms/core.php, source/holocms/web-gallery/static/js/habboclub.js]
timestamp: 2026-11-07T00:44:57+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-06T22:30:17+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-07T00:44:57+00:00"}
---

# Goal

Anyone reads the club page, and a signed-in habbo buys club months for the user
([0017](/decisions/0017-guest-read-access.md), [0056](/decisions/0056-wallet-club-and-inventory-per-user.md),
[0103](/decisions/0103-club-badge-for-every-habbo.md)).

# Steps

- [x] `GET /club` lays out Holo's `club.php` under the Habbo Club tabs: `{shortName} Club: become a VIP!` with its
  pictures and `Benefits` in the first column, `My Membership` in the second, with the art from Holo's web gallery.
- [x] The membership island (`club/membership`): `You are a member` or `You are not a member` of the club, the club
  days left, and the three buy buttons with the `club.*` prices while the purse holds the one-month price; otherwise
  Holo's credits notice and `Get some credits`. Guests see `Please sign in to see your {shortName} Club status.`
- [x] A buy button opens Holo's dialog titled `{SHORTNAME} CLUB` with `Confirm`, `N month(s) of {shortName} Club
  (D days) costs P Credits. You have: C Credits.`, Cancel and Buy; Buy shows the `Subscribe` answer with Done, and
  the membership box shows the new days, as `ajax_club.php` did.
- [x] `POST /club/subscriptions`, signed in, takes 1, 3 or 6 months, anything else counting as one month as in Holo.
  In one transaction it refuses a purse short of the price, refuses going past `club.maxMonths`, adds a period of
  months × `club.daysPerMonth` days from the later of now and the club's end, takes the price with the ledger row
  `Club subscription (N month(s))`, and gives `HC1` to every habbo of the user that lacks it, the buyer wearing it.
- [x] The answers are Holo's: `You don't have enough credits to complete the subscription purchase.`,
  `You can only subscribe for a maximum of M months. If this subscription was completed, you would have exceeded the
  limit.` and `Congratulations! You have successfully subscribed to {shortName} Club for N month(s).`
- [x] The month limit counts as Holo's `months_left` did: the whole months left, the current one included, plus the
  months bought may not pass `club.maxMonths`, unless it is 0.
- [x] When the site reads the club of a user whose periods have all ended, `HC1` leaves the user's habbos, as Holo's
  `IsHCMember` does; a user with no period keeps an `HC1` staff gave.
- [x] Router tests, and a `club` browser suite: a guest's page, buying 1 and then 3 months from the end of the first,
  a purse too short, the limit, `HC1` on two habbos of the user with the buyer wearing it, and `HC1` gone once the
  club ends.
- [x] The differences in [Holo's differences](/reference/holo-differences.md): the club and its badge per user, and
  Holo's other badge left on when the club ends ([0103](/decisions/0103-club-badge-for-every-habbo.md)).

# Verification

```sh
# gofmt, go vet and go test -race in packages/cms; pnpm check in packages/cms
cd tests/e2e && node run.mjs club
```

Results (2026-11-07T00:44:57+00:00):

- `gofmt`, `go vet` and `go test -race` pass in the whole of `packages/cms`, the island guard among them. `packages/cms`
  has no `check` script, so `pnpm build` was run there, which passes, and `svelte-check` over `packages/cms`, which
  finds nothing in `club/membership.svelte`; its 9 errors and 1 warning are in the older `avatar-editor`,
  `promo-widget` and `note-editor`.
- `pnpm test club` in `tests/e2e`, which runs `node run.mjs club`, passes all 18 checks:
  - a guest reads `Reborn ~ Reborn Club` under Credits with the Habbo Club tab, the red `Reborn Club: become a VIP!`
    and `My Membership` boxes and the light brown `Benefits` one, Holo's three product pictures and five benefit
    pictures, its seven headings and texts, and `Please sign in to see your Reborn Club status.` with no buttons;
  - Frank, with 300 credits, is not a member and has the three buttons at 20, 50 and 80 credits; `Buy 1 month` opens
    `REBORN CLUB` with Piccolo, `Confirm` and `1 month(s) of Reborn Club (31 days) costs 20 Credits. You have: 300
    Credits.`, and Cancel buys nothing;
  - Buy answers `Subscribe` and `Congratulations! You have successfully subscribed to Reborn Club for 1 month(s).`,
    the box says `You are a member of Reborn Club` and `You have 31 Club Day(s) left`, 20 credits go with the ledger
    row `club` / `Club subscription (1 month(s))` for Frank, and `HC1` reaches Frank, worn in place of `ADM`, and
    FrankToo, unworn beside the `NWB` it keeps on;
  - the next question counts 280 credits; three months start at the end of the first, the box shows 124 days and the
    Me page's link 124; six more months answer Holo's limit of 6, spelled correctly, and the X closes the dialog;
  - with 30 credits the question shows them and three months answer `You don't have enough credits to complete the
    subscription purchase.`; with 10, Holo's notice, `starts from 20 credits`, leads to `/credits` in place of the
    buttons;
  - once the periods have ended, the page says `You are not a member of Reborn Club`, and `HC1` has left both habbos,
    which keep `ADM` and `NWB`.
  The screenshots `club-guest`, `club-not-member`, `club-confirm`, `club-subscribed`, `club-limit` and
  `club-credits-notice` were read by eye.
- The CMS tests find the guest's page with Holo's prices and the member's days, purse and the prices of the settings;
  a month bought with its period of 31 days from the purchase, the debit, the ledger row with the habbo, `HC1` worn by
  the buyer in place of `ADM`, unworn beside another habbo's own badge, on an archived habbo too, and on no other
  user's habbo; a buyer that already held `HC1` keeping `ADM` on; three months bought during the club starting at
  its end, with 124 days on `/club` and `/me`; 0, 2, 7, -3 and no months each buying one month, and months that are
  no number answering 400; each refusal writing nothing: a purse short of one month or of six, a purse short of the
  price before the limit is counted, six months past the limit and past a limit of 3; the month limit with 6 months
  from none, a seventh month refused, three months on exactly 93 days but not on 94, one month but not three on 114
  days, and no limit at 0; the price of three months and the days of a month from the settings; a guest refused with
  401; `HC1` leaving the two habbos of a user whose club ended when `/club` reads it, the other habbo keeping its own
  badge, while a user with no period keeps the `HC1` staff gave across `/me`, `/club` and two homes, a member keeps
  it, and buying again gives it back worn; and `HC1` leaving when the home of an owner whose club ended is read.
- Breaking these on purpose fails a test, 22 of 22: no debit; `>=` for the month limit; the months left rounded down;
  a limit of 0 kept; a period always starting now; `HC1` given to no habbo; the buyer always or never wearing it; any
  number of months bought as asked; three months at the price of one; another ledger detail or reason; the purse
  checked after the limit; months of 31 days whatever the setting; the answer's days counted from the start; an ended
  club keeping `HC1`; `HC1` taken from a user with no period; the page without the purse, or with three months at the
  price of one; `clubDays` or `inClub` not ending the club; and the purchase open to guests. In the browser, the box
  keeping its days after a purchase fails two checks, and Holo's `maxiamum` one.

# Notes

- The public site spells Holo's `maxiamum` correctly.
- Holo's `SendMUSData` calls wait for the game server ([0013](/decisions/0013-defer-game-server-features.md)).
- The dialog opens on the page's data, as the group purchase's does ([p5-04](/tasks/p5-04-buy-groups.md)): the
  question counts the purse the page loaded with, which each answer keeps up to date, and the purchase checks it all
  again in its transaction, as `club_subscribe.php` did. A session that ended meanwhile gets Holo's
  `Please log in first.` with Done when Buy posts, where Holo's question said it, and the box stays as it was.
- The answers come back as codes with the club's days and the purse after them, which the dialog words as
  `club_subscribe.php` did and the box shows as `ajax_club.php` did. An answer the dialog cannot read shows the
  port's `An unknown error occurred. Please try again in a couple of minutes.` with OK, as the group purchase does.
  A body that is no JSON answers 400, as on every JSON route.
- [0103](/decisions/0103-club-badge-for-every-habbo.md) has the buyer wear `HC1` "as Holo's `GiveHC` does", and
  `GiveHC` put it on only when the user lacked it: a buyer that already holds `HC1`, from another habbo's purchase,
  keeps the badge it wears.
- `HC1` leaves where Holo called `IsHCMember`: in `clubDays`, which the Me page, the account pages and the club page
  read, and in the home page's `inClub`, for the owner's banner and the club skins. The check and the delete share a
  transaction, so that a purchase made since the club was read keeps its badge. The periods stay, so a former member
  given `HC1` by staff loses it at the next read, where Holo had deleted the club's row and kept such a badge.
- The month limit counts the days left, a day begun among them, in months of `club.daysPerMonth`, the month under way
  as a whole one, as Holo's `months_left`: with 6, 114 days left take 1 more month but not 3, and 93 days take 3 but
  94 do not. Holo checked the purse first, and so does the port.
- Holo's pictures are copied to `packages/cms/public/web-gallery` at Holo's paths: the products and the benefits'
  pictures under `v2/images/habboclub`, the boxes' pattern `v2/images/hc_pattern.gif` and the dialog's
  `album1/piccolo_happy.gif`. The products reach the box's borders, 450 pixels apart, as the membership box's two
  parts do, so they undo the card's padding.
