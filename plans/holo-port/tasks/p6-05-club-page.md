---
type: Task
title: Buy club on the club page
description: GET /club shows Holo's club page and membership box, whose buttons open Holo's confirm and result dialogs and buy club months from the shared purse in one transaction, with the club badge for every habbo of the user.
status: todo
phase: p6
depends_on: [p6-01, p6-02]
packages: [packages/cms, tests/e2e]
holo: [source/holocms/club.php, source/holocms/club_confirm.php, source/holocms/club_subscribe.php, source/holocms/ajax_club.php, source/holocms/core.php, source/holocms/web-gallery/static/js/habboclub.js]
timestamp: 2026-11-06T22:30:17+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-06T22:30:17+00:00"}
---

# Goal

Anyone reads the club page, and a signed-in habbo buys club months for the user
([0017](/decisions/0017-guest-read-access.md), [0056](/decisions/0056-wallet-club-and-inventory-per-user.md),
[0103](/decisions/0103-club-badge-for-every-habbo.md)).

# Steps

- [ ] `GET /club` lays out Holo's `club.php` under the Habbo Club tabs: `{shortName} Club: become a VIP!` with its
  pictures and `Benefits` in the first column, `My Membership` in the second, with the art from Holo's web gallery.
- [ ] The membership island (`club/membership`): `You are a member` or `You are not a member` of the club, the club
  days left, and the three buy buttons with the `club.*` prices while the purse holds the one-month price; otherwise
  Holo's credits notice and `Get some credits`. Guests see `Please sign in to see your {shortName} Club status.`
- [ ] A buy button opens Holo's dialog titled `{SHORTNAME} CLUB` with `Confirm`, `N month(s) of {shortName} Club
  (D days) costs P Credits. You have: C Credits.`, Cancel and Buy; Buy shows the `Subscribe` answer with Done, and
  the membership box shows the new days, as `ajax_club.php` did.
- [ ] `POST /club/subscriptions`, signed in, takes 1, 3 or 6 months, anything else counting as one month as in Holo.
  In one transaction it refuses a purse short of the price, refuses going past `club.maxMonths`, adds a period of
  months × `club.daysPerMonth` days from the later of now and the club's end, takes the price with the ledger row
  `Club subscription (N month(s))`, and gives `HC1` to every habbo of the user that lacks it, the buyer wearing it.
- [ ] The answers are Holo's: `You don't have enough credits to complete the subscription purchase.`,
  `You can only subscribe for a maximum of M months. If this subscription was completed, you would have exceeded the
  limit.` and `Congratulations! You have successfully subscribed to {shortName} Club for N month(s).`
- [ ] The month limit counts as Holo's `months_left` did: the whole months left, the current one included, plus the
  months bought may not pass `club.maxMonths`, unless it is 0.
- [ ] When the site reads the club of a user whose periods have all ended, `HC1` leaves the user's habbos, as Holo's
  `IsHCMember` does; a user with no period keeps an `HC1` staff gave.
- [ ] Router tests, and a `club` browser suite: a guest's page, buying 1 and then 3 months from the end of the first,
  a purse too short, the limit, `HC1` on two habbos of the user with the buyer wearing it, and `HC1` gone once the
  club ends.
- [ ] The differences in [Holo's differences](/reference/holo-differences.md): the club and its badge per user, and
  Holo's other badge left on when the club ends ([0103](/decisions/0103-club-badge-for-every-habbo.md)).

# Verification

```sh
# gofmt, go vet and go test -race in packages/cms; pnpm check in packages/cms
cd tests/e2e && node run.mjs club
```

# Notes

- The public site spells Holo's `maxiamum` correctly.
- Holo's `SendMUSData` calls wait for the game server ([0013](/decisions/0013-defer-game-server-features.md)).
