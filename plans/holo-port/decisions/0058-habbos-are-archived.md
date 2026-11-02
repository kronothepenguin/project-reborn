---
type: Decision
title: Habbos are archived, not deleted
description: A user can archive a habbo instead of deleting it, which hides the habbo and keeps the audit trail, and staff can restore it.
status: accepted
timestamp: 2026-11-02T01:24:38+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-02T01:24:38+00:00"}
tags: [habbos, moderation]
---

# Decision

- The owner archives a habbo from `/account/habbos` with their password, and staff restore it.
- The active habbo cannot be archived, so a user always keeps one, and neither can a habbo that owns a group.
- An archived habbo cannot sign in and its home is hidden.
- Its forum posts stay, and they show the habbo as `disabled`.
- Its placed stickers and notes return to the user's inventory.
- It frees one of the slots of `registration.maxHabbosPerUser`, and its name stays reserved.

# Context

A real delete would cascade through 12 tables and blank 9 columns, including the targets of the staff log. The user
asked: "what you think about deleting habbos? too much work? we still have to keep audit so should we archive them
instead?", and then: "yes, i agreed with rules, extra: forum post stay but show habbo as "disabled" meaning it is
archived".

# Consequences

- `avatars` gains `archived_at`, and the queries that read habbos filter on it.
- Each rule arrives with its feature: hiding now, restoring in [HK-B](/phases/hk-b-users-moderation.md), the stickers in
  [P3](/phases/p3-homes.md) and the label in [P5](/phases/p5-groups-forum.md).
