---
type: Decision
title: Every habbo of a club member gets the club badge
description: Each club purchase gives Holo's club badge HC1 to every habbo of the user that lacks it, the buyer wears it at once, and HC1 leaves all of them when the club ends.
status: accepted
timestamp: 2026-11-06T22:30:17+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-06T22:30:17+00:00"}
tags: [economy, club, badges]
---

# Decision

- Each club purchase gives the badge `HC1` to every habbo of the user that does not hold it.
- The habbo that buys wears `HC1` at once, taking off the badge it wore, as Holo's `GiveHC` does. The user's other
  habbos keep the badge they wear.
- When the club ends, `HC1` leaves every habbo of the user, as Holo's `IsHCMember` takes it away.

# Context

The club belongs to the user, so all their habbos are members ([0056](/decisions/holo-port/0056-wallet-club-and-inventory-per-user.md)),
while badges belong to each habbo. Holo had one habbo per account: buying club gave it `HC1` and wore it, and the badge
went when the club ended. Asked which habbos get `HC1` when a user buys club, offered the habbo that buys or every
habbo of the user, the user chose "Every habbo of the user": "Each purchase gives HC1 to every habbo of the user that
lacks it; only the buyer wears it at once." The question said that in both options `HC1` goes away when the club ends,
as in Holo.

# Consequences

- A habbo added while the club runs gets `HC1` at the user's next purchase.
- Holo also hid whatever badge the habbo wore when the club ended (`badge_status = 0`); here only `HC1` goes, so a
  habbo that wore another badge keeps it on.
- P6's club purchase writes the badges in the purchase's transaction.
