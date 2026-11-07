---
type: Task
title: Keep every voucher deletable
description: A voucher whose code is . or .. can be created but not deleted, because a browser reads those codes in the delete's address as folders; the user chooses the fix.
status: todo
phase: p6
depends_on: [p6-07]
packages: [packages/housekeeping, tests/e2e]
holo: [source/holocms/housekeeping/vouchers.php]
timestamp: 2026-11-07T02:22:16+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-07T00:25:09+00:00"}
---

# Goal

Every voucher that Voucher Management creates can also be deleted while unused, since a wrong voucher has no other fix
([0063](/decisions/0063-what-housekeeping-can-delete.md)).

# Steps

- [x] The user chooses one of the fixes in `# Notes`: `Create Voucher` refuses `.` and `..`
  ([0106](/decisions/0106-dot-voucher-codes-refused.md)).
- [ ] The chosen fix in `packages/housekeeping/internal/router/vouchers.go`, with router tests.
- [ ] A check in the `housekeeping-vouchers` browser suite.
- [ ] The difference in [Holo's differences](/reference/holo-differences.md).

# Verification

```sh
# gofmt, go vet and go test -race in packages/housekeeping
cd tests/e2e && pnpm test housekeeping-vouchers
```

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
