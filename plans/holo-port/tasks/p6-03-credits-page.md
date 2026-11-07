---
type: Task
title: Show the credits page and redeem vouchers
description: GET /credits shows Holo's credits page with its two BBCode boxes and the purse, and the purse's Submit redeems a voucher in one transaction with Holo's answers.
status: done
phase: p6
depends_on: [p6-01, p6-02]
packages: [packages/cms, tests/e2e]
holo: [source/holocms/credits.php, source/holocms/redeemvoucher.php, source/holocms/web-gallery/static/js/fullcontent.js]
timestamp: 2026-11-07T00:28:48+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-06T22:30:17+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-07T00:28:48+00:00"}
---

# Goal

Anyone reads the credits page, and a signed-in habbo sees the purse and redeems a voucher
([0017](/decisions/0017-guest-read-access.md), [0105](/decisions/0105-credits-boxes-in-bbcode.md)).

# Steps

- [x] `GET /credits` lays out Holo's `credits.php`: the green `creditsPage.box2*` box in the first column, and the
  brown `Your purse` box and the blue `creditsPage.box1*` box in the second, under the Credits tab.
- [x] The bodies are rendered from BBCode, beside their pictures: `credits_permission.png` in the blue box and the
  palm chair in the green one, taken from Holo's web gallery as [The art](/reference/art.md) says.
- [x] The purse island: `You Currently Have:`, the shared purse's credits, `Account transactions`, and
  `Enter redemption code:` with Submit, which Enter also sends; guests see `You need to be logged in to see the
  purse.`
- [x] `POST /credits/vouchers`, signed in, in one transaction: claims the voucher, adds its credits to the purse and
  writes the ledger row `Credit voucher redeem` with the active habbo. The answer replaces the purse as Holo's does:
  the new balance and `You have redeemed N credits successfully.` in green, or `Your redeem code could not be found.
  Please try again.` in red.
- [x] Router tests, and a `credits` browser suite: a guest's page, a redemption that adds to the purse and the ledger,
  a code used twice, a code in other case, and an unknown code.
- [x] The differences in [Holo's differences](/reference/holo-differences.md): the voucher is kept as redeemed instead
  of deleted, and item vouchers are gone.

# Verification

```sh
# gofmt, go vet and go test -race in packages/cms; pnpm check in packages/cms
cd tests/e2e && node run.mjs credits
```

Results (2026-11-07T00:28:48+00:00):

- `gofmt` lists nothing, and `go vet` and `go test -race` pass in the whole of `packages/cms`. `packages/cms` has no
  `check` script, so `pnpm build` ran there, and `svelte-check` over `packages/cms` finds nothing in
  `credits/purse.svelte`; its 9 errors and 1 warning are the ones `avatar-editor`, `promo-widget` and `note-editor`
  already had. `dist/credits.html` holds the purse island once, inside `[[ if .SignedIn ]]`, after the layout's first
  island, and the island guard passes.
- The CMS tests give a guest Holo's two boxes from their settings, `* ` lines and all, and a changed heading and body
  rendered from BBCode, escaped and without smilies; show both habbos of a user the shared purse; close the page for
  maintenance; fill the purse and the ledger with `voucher` and `Credit voucher redeem` for the active habbo, the
  user's second, which the kept voucher names; pay a code once, the second answer red with the same balance; find a
  code in other case and with spaces after it, but not with a space before it, a tab after it, blank or unknown,
  which write nothing; and refuse a guest with 401 and a cross-site post with 403.
- `flock … pnpm test credits`, which runs `node run.mjs credits`, passes all 13 checks: Holo's title and the Credits
  tab and sub-tab; the green box in the first column, the brown purse and the blue box in the second; the BBCode beside
  the palm chair and `credits_permission.png`, both loaded; the guest's line; FrankToo's purse with the shared 100
  credits, the link to `/credits/transactions` and the field; Submit giving `120 Credits` and Holo's green answer
  without the field; the ledger row and the voucher kept for FrankToo; Enter sending a used code in other case, which
  answers in red; `SUMMER50` redeeming `summer50`; an unknown code changing nothing; and Frank seeing the same purse.
  The screenshots `credits-guest`, `credits-purse`, `credits-redeemed` and `credits-not-found` were read by eye beside
  Holo's page drawn from its own files and styles.
- Breaking these on purpose fails a test, 13 of 13 in Go: the spaces after the code kept, every space trimmed, no
  ledger row, a row without the habbo or with another detail, no credits added, the balance read before the change, a
  refusal answered 200, the voucher claimed for another habbo, the boxes swapped, smilies in the boxes, the purse not
  read, and guests let through; and 6 of 6 in the browser: the field kept after the answer, the form posting itself,
  every answer green, the balance kept, the guest's line gone and the green box moved to the second column.

# Notes

- Holo's answer has no code field, so a second voucher waits for the page to load again, as in Holo.
- Holo's `@SendMUSData('UPRC' . $my_id)` waits for the game server ([0013](/decisions/0013-defer-game-server-features.md)).
- MySQL compared Holo's codes in any case and without the spaces after them; the store ignores the case, and the
  handler drops the spaces after the code, as the tag fight does ([p4-08](/tasks/p4-08-tags-page.md)).
- `POST /credits/vouchers` takes `{"code": …}` and answers the balance with Holo's message, 200 for green and 422 for
  red. Submit waits while a code is on its way, as the forum's Save does, and a request that fails shows the purse's
  balance with `An unknown error occurred. Please try again in a couple of minutes.` in red, as P5's islands do.
- The pictures and the purse icon are copied at Holo's paths under `packages/cms/public/web-gallery`, as P5 copied
  Holo's group icons.
- The Card's own padding stands for Holo's `box-content`, as on the staff page, and the purse keeps Holo's other
  paddings, so that the field and Submit share a line as in Holo.
