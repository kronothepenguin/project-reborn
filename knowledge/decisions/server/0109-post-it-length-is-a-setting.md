---
type: Decision
title: A post-it's longest text is a setting, 684 by default
description: The setting game.postItMaxLength, 684 by default as Holo's limit, is the most characters of a post-it, and a longer note is refused.
status: accepted
timestamp: 2026-11-11T18:05:11+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-11T18:05:11+00:00"}
tags: [server, furni, post-its, settings]
---

# Decision

- The setting `game.postItMaxLength`, 684 by default, is the most characters a post-it holds. Housekeeping's Game form
  changes it.
- A longer note is refused, as Holo refused it: nothing is saved.

# Context

Holo refused any note over 684 characters. Offered a setting or the fixed number, the user chose "A setting, 684 by
default (Recommended)": "A game setting in housekeeping, like the present note's 200. A longer note is refused, as Holo
did."

# Consequences

- s5-12 adds the setting and reads it.
