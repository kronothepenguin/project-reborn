---
type: Decision
title: What housekeeping can delete
description: The staff log, credit history and bans stay for audit, help tickets are closed instead of deleted, and unused vouchers can be deleted.
status: accepted
timestamp: 2026-11-02T01:24:38+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-02T01:24:38+00:00"}
tags: [housekeeping, moderation]
---

# Decision

- The staff log and the credit history are never changed or deleted.
- Bans are lifted, and help tickets are closed. Holo deleted both, and here they stay as history.
- Home store items are disabled, because purchases point at them.
- Unused vouchers can be deleted, because a wrong voucher has no other fix. Redeemed vouchers stay.
- Attributes stay per resource, not per action.

# Context

The user asked: "do we have the full crud for resources?" Told that most gaps are there for audit, and offered the
deletion of unused vouchers, the user answered "ok".

# Consequences

- [P6](/phases/p6-economy.md) gains a route to delete an unused voucher.
