---
type: Decision
title: The account transactions page shows the habbo of each row
description: The public Account transactions page adds a Habbo column to Holo's Date, Activity and Description, since the purse is shared by the user's habbos.
status: accepted
timestamp: 2026-11-06T22:30:17+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-06T22:30:17+00:00"}
tags: [economy, transactions]
---

# Decision

- `GET /credits/transactions` lists the 50 newest rows of the user's ledger, as Holo's `transactions.php` does, with
  Holo's Date, Activity and Description and a Habbo column: the habbo that acted, empty when none did.

# Context

The purse is shared by all the user's habbos ([0056](/decisions/holo-port/0056-wallet-club-and-inventory-per-user.md)), and
housekeeping's transaction log already shows a Habbo column. Asked whether the public page should show which habbo
made each change, the user chose "Add a Habbo column (Recommended)": "With a shared purse, it tells which habbo spent
or got the credits."

# Consequences

- The ledger's rows already keep the habbo that acted (`wallet_transactions.avatar_id`).
