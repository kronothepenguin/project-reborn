---
type: Task
title: Keep every voucher deletable
description: A voucher whose code is . or .. can be created but not deleted, because a browser reads those codes in the delete's address as folders; the user chooses the fix.
status: done
phase: p6
depends_on: [p6-07]
packages: [packages/housekeeping, tests/e2e]
holo: [source/holocms/housekeeping/vouchers.php]
timestamp: 2026-11-07T02:37:36+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-07T00:25:09+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-07T02:37:36+00:00"}
---

# Goal

Every voucher that Voucher Management creates can also be deleted while unused, since a wrong voucher has no other fix
([0063](/decisions/0063-what-housekeeping-can-delete.md)).

# Steps

- [x] The user chooses one of the fixes in `# Notes`: `Create Voucher` refuses `.` and `..`
  ([0106](/decisions/0106-dot-voucher-codes-refused.md)).
- [x] The chosen fix in `packages/housekeeping/internal/router/vouchers.go`, with router tests.
- [x] A check in the `housekeeping-vouchers` browser suite.
- [x] The difference in [Holo's differences](/reference/holo-differences.md).

# Verification

```sh
# gofmt, go vet and go test -race in packages/housekeeping
cd tests/e2e && pnpm test housekeeping-vouchers
```

Results (2026-11-07T02:37:36+00:00):

- `gofmt` lists nothing, and `go vet` and `go test -race` pass in `packages/housekeeping`, the tests in 233 seconds.
  `TestABadVoucherIsRefused` refuses `.`, `..` and ` .. ` with `The redemption code cannot be . or ..` and 422,
  creating and logging nothing; `TestARefusedVoucherKeepsWhatWasTyped` keeps `..` in the form; and
  `TestOtherCodesOfDotsAreCreatedAndDeleted` creates `...`, `..a`, `a..`, `. .`, `./..`, `%2E`, `%2E%2E` and `.%2e`
  and deletes each through its escaped address.
- Breaking the refusal on purpose fails a router test, 8 of 8: no refusal; `.` alone or `..` alone refused; the code
  checked before its trim; any code that starts with a dot, any code of dots only or any code holding `..` refused;
  and the message in other words. Moving the refusal after the amount's check passes, since no decision orders
  those two answers.
- The suite ran under the shared lock as `pnpm test housekeeping-vouchers`: its 21 checks pass in a real browser,
  three of them new: `.` and `..` refused with the message and 422, each kept in the field, and `...` created,
  listed and deleted through its address, with its two log rows. Breaking the server on purpose fails it, 2 of 2:
  without the refusal, `.` and `..` are created and stay in the list after their `Delete`; refusing every code of
  dots stops `...` from being created.

# Notes

- Found by [p6-07](/tasks/p6-07-housekeeping-vouchers.md). A code takes any 20 characters, as Holo's did, and the
  delete is `POST /housekeeping/vouchers/{code}/delete`. Every code reaches it, slashes, `?`, `#`, `%` and spaces
  included, except `.` and `..`: a browser reads them in an address as "this folder" and "the folder above", even
  written as `%2E`, so the `Delete` of a voucher `..` posts to `/housekeeping/delete` and answers a bare 404, and the
  voucher stays.
- Blocked on the user's choice:
  1. Recommended: `Create Voucher` refuses the codes `.` and `..` alone, with a message such as
     `The redemption code cannot be . or ..`, so every other code Holo took still goes through.
  2. Codes take only letters and digits, as badge codes do, which also refuses spaces, slashes and the like.
  3. Nothing changes: those two vouchers can be created and redeemed, but never deleted.
- Unblocked on 2026-11-07: the user chose the first, [0106](/decisions/0106-dot-voucher-codes-refused.md).
- The refusal follows the code's other checks, before the amount's, and reads the trimmed code, as the length check
  does.
- Only the codes `.` and `..` are read as folders: a code such as `...`, or `%2E`, which its address escapes to
  `%252E`, reaches the delete as one segment.
