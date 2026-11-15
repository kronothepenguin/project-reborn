---
type: Decision
title: A habbo has no achievements yet
description: 436 lists no achievements and the server sends no 437, so GETSELECTEDBADGES, which the client sends only after a 437, waits for the phase that brings achievements.
status: accepted
timestamp: 2026-11-10T02:32:11+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-10T02:32:11+00:00"}
tags: [server, achievements]
---

# Decision

- `GET_POSSIBLE_ACHIEVEMENTS` gets 436 with no achievement, and the server never sends 437.
- `GETSELECTEDBADGES`, which the client sends only after a 437, gets no handler until a phase brings achievements;
  `knowledge/features/badges-and-achievements/later.md` keeps both.

# Context

The hotel has no achievement in its database. Offered an empty 436 now, or a task that designs achievements in S2, the
user chose "None yet (Recommended)": "436 lists no achievements and the server never sends 437. GETSELECTEDBADGES,
which the client sends only after a 437, then waits for the phase that brings achievements; plans/later.md notes it."

# Consequences

- s2-07 answers 436 with none.
