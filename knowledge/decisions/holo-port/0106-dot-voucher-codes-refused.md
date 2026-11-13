---
type: Decision
title: Voucher codes . and .. are refused
description: Create Voucher refuses the codes . and .. alone, which a browser reads as folders in the delete's address, and takes every other code Holo took, so that every voucher it creates can be deleted.
status: accepted
timestamp: 2026-11-07T02:22:16+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-07T02:22:16+00:00"}
tags: [economy, housekeeping, vouchers]
---

# Decision

- `Create Voucher`, in housekeeping's Voucher Management, refuses the codes `.` and `..` alone, with
  `The redemption code cannot be . or ..`.
- Every other code Holo took still works, and the delete stays `POST /housekeeping/vouchers/{code}/delete`.

# Context

p6-07 found that a browser reads `.` and `..` in
`/housekeeping/vouchers/{code}/delete` as folders, even escaped, so `Delete` on those two vouchers answered 404 and they
stayed, though a wrong voucher has no other fix ([0063](/decisions/holo-port/0063-what-housekeeping-can-delete.md)). Offered four
choices, the user chose "Refuse . and .. (Recommended)": "Create Voucher refuses those two codes alone, with e.g.
`The redemption code cannot be . or ..`. Every other code Holo took still works, and the route stays as planned." The
other choices were to post the code in the form, to take letters and digits only, or to leave it.

# Consequences

- p6-10 adds the refusal, so every voucher that Voucher Management
  creates can be deleted while unused.
