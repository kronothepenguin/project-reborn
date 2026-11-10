---
type: Decision
title: Near habbos read chat, far ones see a bubble
description: Habbos within game.chatRange tiles each way, 5, read a habbo's chat, as Holo had it; farther ones get the line without its text, which the client draws as its unheard bubble. Shouts reach everyone.
status: accepted
timestamp: 2026-11-10T18:05:15+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-10T18:05:15+00:00"}
tags: [server, rooms, chat]
---

# Decision

- A habbo's chat (`CHAT`) reaches, with its text, the habbos within `game.chatRange` tiles of it each way, 5 by
  default, as Holo had it.
- Farther habbos get the chat line without its text, which the R26 client draws as its unheard bubble over the
  speaker.
- A shout (`SHOUT`) reaches everyone in the room with its text.

# Context

Holo sent chat only to habbos fewer than 6 tiles away on both axes, and nothing to the others; the client has an
`UNHEARD` mode, a chat line with no text, that Holo never used. Offered near and far with a bubble, near only, or the
whole room, the user chose "Near reads, far sees a bubble (Recommended)": "Habbos within 5 tiles each way (a setting)
read the text, as Holo. Farther ones get the line without its text, which the client draws as its 'unheard' bubble over
the speaker. Example: across the Welcome Lounge you see a bubble over someone talking, but not the words."

# Consequences

- [s4-05](/tasks/s4-05-chat-and-gestures.md) applies it, with the setting `game.chatRange`.
