---
type: Task
title: Show the account transactions
description: GET /credits/transactions lists the 50 newest rows of the user's ledger in Holo's table with a Habbo column, beside the purse.
status: done
phase: p6
depends_on: [p6-03]
packages: [packages/cms, tests/e2e]
holo: [source/holocms/transactions.php]
timestamp: 2026-11-07T00:41:01+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-06T22:30:17+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-07T00:41:01+00:00"}
---

# Goal

A signed-in habbo reads the shared purse's history ([0104](/decisions/0104-transactions-show-the-habbo.md)).

# Steps

- [x] `GET /credits/transactions`, signed in, lays out Holo's `transactions.php`: the brown `Account transactions` box
  with Holo's text and table, and the purse island in the second column.
- [x] The table lists the 50 newest ledger rows of the user, newest first, in Holo's even and odd rows: Date in Holo's
  `d-m-Y H:i:s`, Activity, Description and Habbo, the habbo that acted or nothing.
- [x] A row's description is its detail, or its reason when it has none, as housekeeping's transaction log shows it.
- [x] Router tests, and the `credits` browser suite: rows of two habbos of one user, the 50-row limit and a guest
  sent to sign in.
- [x] The Habbo column in [Holo's differences](/reference/holo-differences.md).

# Verification

```sh
# gofmt, go vet and go test -race in packages/cms; pnpm check in packages/cms
cd tests/e2e && node run.mjs credits
```

Results (2026-11-07T00:41:01+00:00):

- `gofmt` lists nothing, and `go vet` and `go test -race` pass in the whole of `packages/cms`. `packages/cms` has no
  `check` script, so `pnpm build` ran there, and `svelte-check` over `packages/cms` finds nothing in the credits
  components; its 9 errors and 1 warning are still those of `avatar-editor`, `promo-widget` and `note-editor`.
  `dist/credits/transactions.html` holds the purse island after the layout's first island, and the island guard passes.
- The CMS tests list the user's ledger newest first, with Holo's date, the signed activity, the detail or else the
  reason, and the habbo that acted, an archived one too, or nothing, in Holo's grey and white rows, beside the purse's
  balance and without another user's rows; show the 50 newest of 51 rows; and send a guest to `/`.
- `flock … pnpm test credits`, which runs `node run.mjs credits`, passes all 19 checks, 6 of them new: the purse's link
  opening `Account transactions` under the Credits tab with neither sub-tab chosen and Holo's words; the table's
  headings, and the rows of Frank, of FrankToo and of no habbo, newest first, with Holo's dates; Holo's grey rows; the
  purse beside the table with the shared 170 credits and its field; the 50 newest of 64 rows; and a guest sent to the
  sign-in form. The screenshot `credits-transactions` was read by eye beside Holo's page drawn from its own files and
  styles.
- Breaking these on purpose fails a test, 10 of 10 in Go: 51 rows, the detail alone, the reason before the detail, no
  habbo, the stripes inverted, another date format, the time an hour off UTC, another user's ledger, the purse not
  read and guests let in; and 5 of 5 in the browser: the Habbo column dropped, every row grey, the Credits sub-tab
  chosen, no purse beside the table and Holo's words changed.

# Notes

- Holo's table had no pages, and showed its 50 rows only.
- Holo's page id `6b` chose the Credits tab and neither of its sub-tabs, and so does this page.
- The brown purse box is `credits/purse-box.astro` on both pages, around the same island, so the purse redeems here
  too, as Holo's `PurseHabblet` did on both.
- The words above the table keep Holo's `box-content` padding inside the Card, so that they line up with the table's
  cells as in Holo.
- The Habbo column names an archived habbo too: 0104 names the habbo that acted, housekeeping's log does the same,
  and the `archived` of [0089](/decisions/0089-archived-habbos-show-as-archived.md) is the board's.
- The table's grey and its headings' colour are in [the colours](/reference/colours.md).
