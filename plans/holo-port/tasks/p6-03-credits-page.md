---
type: Task
title: Show the credits page and redeem vouchers
description: GET /credits shows Holo's credits page with its two BBCode boxes and the purse, and the purse's Submit redeems a voucher in one transaction with Holo's answers.
status: todo
phase: p6
depends_on: [p6-01, p6-02]
packages: [packages/cms, tests/e2e]
holo: [source/holocms/credits.php, source/holocms/redeemvoucher.php, source/holocms/web-gallery/static/js/fullcontent.js]
timestamp: 2026-11-06T22:30:17+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-06T22:30:17+00:00"}
---

# Goal

Anyone reads the credits page, and a signed-in habbo sees the purse and redeems a voucher
([0017](/decisions/0017-guest-read-access.md), [0105](/decisions/0105-credits-boxes-in-bbcode.md)).

# Steps

- [ ] `GET /credits` lays out Holo's `credits.php`: the green `creditsPage.box2*` box in the first column, and the
  brown `Your purse` box and the blue `creditsPage.box1*` box in the second, under the Credits tab.
- [ ] The bodies are rendered from BBCode, beside their pictures: `credits_permission.png` in the blue box and the
  palm chair in the green one, taken from Holo's web gallery as [The art](/reference/art.md) says.
- [ ] The purse island: `You Currently Have:`, the shared purse's credits, `Account transactions`, and
  `Enter redemption code:` with Submit, which Enter also sends; guests see `You need to be logged in to see the
  purse.`
- [ ] `POST /credits/vouchers`, signed in, in one transaction: claims the voucher, adds its credits to the purse and
  writes the ledger row `Credit voucher redeem` with the active habbo. The answer replaces the purse as Holo's does:
  the new balance and `You have redeemed N credits successfully.` in green, or `Your redeem code could not be found.
  Please try again.` in red.
- [ ] Router tests, and a `credits` browser suite: a guest's page, a redemption that adds to the purse and the ledger,
  a code used twice, a code in other case, and an unknown code.
- [ ] The differences in [Holo's differences](/reference/holo-differences.md): the voucher is kept as redeemed instead
  of deleted, and item vouchers are gone.

# Verification

```sh
# gofmt, go vet and go test -race in packages/cms; pnpm check in packages/cms
cd tests/e2e && node run.mjs credits
```

# Notes

- Holo's answer has no code field, so a second voucher waits for the page to load again, as in Holo.
- Holo's `@SendMUSData('UPRC' . $my_id)` waits for the game server ([0013](/decisions/0013-defer-game-server-features.md)).
