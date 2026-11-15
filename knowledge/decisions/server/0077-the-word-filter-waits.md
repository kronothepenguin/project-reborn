---
type: Decision
title: The word filter waits for a task of its own
description: Chat is not filtered in S4; the moderation feature's later notes keep Holo's word filter for one task that covers chat, room names and messages.
status: accepted
timestamp: 2026-11-10T18:05:15+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-10T18:05:15+00:00"}
tags: [server, chat, later]
---

# Decision

- Chat is not filtered in S4: it shows what was typed.
- `knowledge/features/moderation/later.md` keeps Holo's word filter, a word list that housekeeping edits and whose words
  become `bobba`, for one task that covers chat, room names and messenger messages together.

# Context

Holo replaced each word of its `wordfilter` table with `wordfilter_censor`, `bobba`, in chat, room names and messages,
while `wordfilter_enable` was on. Offered the filter later or now for chat, the user chose "Later, on its own
(Recommended)": "No filter in S4. plans/later.md keeps Holo's filter, a word list that housekeeping edits, for one task
that covers chat, room names and messages together. Example: in S4, chat shows exactly what was typed."

# Consequences

- `knowledge/features/moderation/later.md` holds the word filter.
