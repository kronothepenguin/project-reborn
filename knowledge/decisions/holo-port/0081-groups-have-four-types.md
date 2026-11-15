---
type: Decision
title: Groups have Holo's four types, Unlimited included
description: A group is Regular, Exclusive, Private or Unlimited as in Holo; an Unlimited group takes anyone without the 500 limit, never changes type again, and still lists its members.
status: accepted
timestamp: 2026-11-04T20:35:37+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-04T20:35:37+00:00"}
tags: [groups, p5]
---

# Decision

- A group is Regular (anyone joins until it has 500 members), Exclusive (an admin accepts each request), Private
  (nobody joins) or Unlimited (anyone joins, with no limit), with Holo's texts.
- An Unlimited group never changes type again, as in Holo.
- Its members are listed like any group's, as Holo listed them, although its description says "Unable to browse
  members".

# Context

The schema had only open, moderated and closed. Told that Holo has a fourth type, the user chose to add it as Holo has
it, over hiding its member list or leaving it out.

# Consequences

- `groups.access` gains the value `unlimited`. The column is TEXT without a CHECK, so the schema needs no update.
