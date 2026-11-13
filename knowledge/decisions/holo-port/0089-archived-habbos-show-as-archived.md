---
type: Decision
title: Habbos are archived, and the forum shows them as archived
description: A user archives a habbo instead of deleting it, which hides the habbo and keeps the audit trail, staff can restore it, and its forum posts show archived in place of its name.
status: accepted
timestamp: 2026-11-04T20:35:37+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-04T20:35:37+00:00"}
tags: [habbos, moderation, forum]
---

# Decision

- The owner archives a habbo from `/account/habbos` with their password, and staff restore it.
- The active habbo cannot be archived, so a user always keeps one, and neither can a habbo that owns a group.
- An archived habbo cannot sign in and its home is hidden.
- Its forum posts stay. Everywhere on the board, in its post boxes, as a thread's opener, in "Last post by" and in
  "Last modified ... by", `archived` replaces its name, with no link, and its post boxes show no avatar, badges, motto
  or message count.
- Its placed stickers and notes return to the user's inventory.
- It frees one of the slots of `registration.maxHabbosPerUser`, and its name stays reserved.

# Context

[0058](/decisions/holo-port/0058-habbos-are-archived.md) took every rule above but the forum's, where it showed the habbo as
`disabled`. Asked what that looks like, the user chose the name replaced everywhere with no link and an empty box, and
answered: "yes, instead of "disabled" -> "archived"".

# Consequences

- `avatars` has `archived_at`, and the queries that read habbos filter on it.
- Each rule arrives with its feature: hiding with 0058, restoring in HK-B, the
  stickers in P3 and the forum in P5.
