---
type: Decision
title: A present's note is cut at 200 characters
description: The note a buyer writes on a present keeps its first game.presentNoteMaxLength characters, 200 by default, a setting of the Game form.
status: accepted
timestamp: 2026-11-11T17:28:49+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-11T17:28:49+00:00"}
tags: [server, furni, presents, settings]
---

# Decision

- A present's note keeps its first `game.presentNoteMaxLength` characters, 200 by default, as a chat line is cut
  ([0078](/decisions/0078-a-chat-line-is-cut-at-100-characters.md)).
- The setting is in housekeeping's Game form.

# Context

Holo put no limit on a note, which every habbo in the room reads on the box's card. Offered a setting of 200 characters,
or no limit as Holo, the user chose "A setting, 200 characters by default (Recommended)": "A game setting in
housekeeping's Game form, game.presentNoteMaxLength; a longer note is cut there, as a chat line is cut at 100. Example:
a 500-character note arrives as its first 200 characters."

# Consequences

- [s5-06](/tasks/s5-06-presents.md) declares the setting and applies it.
