---
type: Task
title: Manage vouchers in housekeeping
description: Housekeeping's Voucher Management creates credit vouchers with Holo's random code, lists the unused ones and deletes an unused one, each logged, for holders of housekeeping.vouchers.
status: done
phase: p6
depends_on: [p6-02]
packages: [packages/housekeeping, tests/e2e]
holo: [source/holocms/housekeeping/vouchers.php, source/holocms/housekeeping/usermenu.php]
timestamp: 2026-11-07T00:32:36+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-06T22:30:17+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-07T00:32:36+00:00"}
---

# Goal

Staff make the credit vouchers that habbos redeem ([0063](/decisions/0063-what-housekeeping-can-delete.md)).

# Steps

- [x] `Voucher Management` in the menu, where Holo's `usermenu.php` has it, for holders of `housekeeping.vouchers`.
- [x] `GET /housekeeping/vouchers` lays out Holo's page: `Create Voucher` with `Redemption Code`, filled with a random
  code of 8 of Holo's characters drawn with `crypto/rand`, and `Amount`, with Holo's help texts; and
  `Existing vouchers` with each unused voucher's code and credits. Holo's `Type` list goes, since vouchers give
  credits only.
- [x] `POST /housekeeping/vouchers` creates the voucher: `Please do not leave any fields blank.` for a blank field, a
  whole number from 1 to 2147483647 as `Give Credits` takes, a code of at most 20 characters that no voucher has, and
  `The voucher has been created successfully.` The staff log reads `Created voucher <code> worth <credits> credits`.
- [x] `POST /housekeeping/vouchers/{code}/delete` deletes an unused voucher, with a staff log row; a redeemed one stays.
- [x] Router tests, and a `housekeeping-vouchers` browser suite: create, the list, a blank field, a taken code, a
  delete, and a staff member without the access.
- [x] The differences in [Holo's differences](/reference/holo-differences.md): credit vouchers only, deletion, the
  checks on the amount and the code.

# Verification

```sh
# gofmt, go vet and go test -race in packages/housekeeping; pnpm check in packages/housekeeping
cd tests/e2e && node run.mjs housekeeping-vouchers
```

Results (2026-11-07T00:32:36+00:00):

- `gofmt`, `go vet` and `go test -race` pass in `packages/housekeeping`, the tests in 221 seconds, and
  `make check-docs` in `packages/store`, whose staff log entity lists `vouchers.create` and `vouchers.delete`.
- `pnpm check` answers `Command "check" not found`: only `packages/components` has a `check` script, which the gates
  run. `pnpm build` builds `vouchers.html` with its placeholders in their places.
- The suite ran under the shared lock as `pnpm test housekeeping-vouchers housekeeping-access`. `housekeeping-vouchers`
  passes its 18 checks in a real browser: `Voucher Management` in a `Credits` box between User Management and
  Moderation, the page under Users & Moderation named `Vouchers`, Holo's heading, labels and help with `recieve` and
  no `Type`, an offered code of 8 of Holo's characters, the list's heading and columns, a blank amount refused with
  Holo's message and 422 keeping the code, an amount of `1.5` refused, a voucher created with its credits and creator
  and Holo's answer, a new code offered after it, the list, a taken code in other case refused and kept, a code
  ` Summer/08 gift? ` trimmed, created, listed in order and deleted through its escaped address, a voucher redeemed
  meanwhile kept with the answer and 404, the three log rows in Holo's words with their actor, a moderator reaching
  the page, and a helper seeing the link and getting Access Denied. The screenshots `vouchers`, `vouchers-created`
  and `vouchers-redeemed` show the page. `housekeeping-access` passes its 193 checks with the three new routes.
- Breaking these on purpose fails a router test, 34 of 34: the attribute on each of the three routes; the trim of the
  code; each blank field; 21 characters let through and 20 refused; the length in bytes; an amount of 0 or 2147483648
  let through, and 1 or 2147483647 refused; the amount trimmed; a taken code unanswered; the creator not kept; the
  creation's log row unwritten or not in Holo's words; the creation answering its post instead of redirecting; the
  created and deleted answers missing; no code offered on the page; a redeemed voucher counted as deleted; the delete's
  log row unwritten or wrong; a missing voucher answering 200 or offering no new code; the code put raw or
  query-escaped into the delete's address; codes of 7; a `c` among the characters; the digits once; a plain modulo,
  which favours the first 43 places; and Holo's `rand(0,71)`, which loses a character now and then.
- Breaking the pages fails the browser suite, 6 of 6: the delete posting the raw code, the `Credits` box after
  Moderation, `recieve` spelled right, the code field under another name, the answers left out, and the page under
  Site & Content.

# Notes

- Housekeeping keeps Holo's spelling, `recieve` among it.
- Holo's characters leave out `c`, and repeat the digits. The router test holds Holo's string apart from the code's, so
  a change to either fails it, and a chi-square over 10,000 codes checks that each character comes up as often as its
  places in the string say.
- The page keeps Holo's name, `Vouchers`, as the other pages keep their `$pagename`, under Users & Moderation; the link
  shows to all staff, as every link of the menu does.
- What Holo never checked is answered in the words of its page and of the other forms: `The redemption code must be at
  most 20 characters.`, `The amount must be a number from 1 to 2147483647.` and `A voucher with this redemption code
  already exists.`. The delete answers `The voucher has been deleted successfully.`, or, with 404 as the uploaded
  images do, `Unable to delete voucher; this voucher does not exist or has been redeemed!`.
- The code is trimmed as the group, item and banner forms trim what they take; the amount is not, as `Give Credits`
  reads it.
- `DeleteUnusedVoucher` returns only the rows it removed, so the delete's log row names the code, `Deleted voucher
  <code>`, and the creation's row keeps the credits.
- A code reaches the delete as one segment of its address through `url.PathEscape`, so `/`, `?`, `#`, `%` and spaces
  go through; `.` and `..` cannot, since a browser reads them as folders:
  [p6-10](/tasks/p6-10-keep-every-voucher-deletable.md) asks the user how to fix it.
