---
type: Decision
title: A chat line is cut at 100 characters
description: The server keeps the first game.chatMaxLength characters, 100, of a chat, shout or whisper, and shows and saves those.
status: accepted
timestamp: 2026-11-10T18:05:15+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-10T18:05:15+00:00"}
tags: [server, rooms, chat]
---

# Decision

- The server keeps the first `game.chatMaxLength` characters, 100 by default, of a chat, a shout or a whisper's text,
  and shows and saves those.

# Context

The client's chat field is bounded by its width, about 55 to 65 letters, not by a count, and Holo had no limit, so a
modified client could send a line of about 256 KB, which the chat history saves. Offered 100, 255 or no limit, the user
chose "Cut at 100 characters (Recommended)": "The server keeps the first 100 characters (a setting) of a chat, shout or
whisper, and shows and saves those. A real client never reaches it. Example: a 300-character line from a modified
client shows its first 100 characters."

# Consequences

- [s4-05](/tasks/s4-05-chat-and-gestures.md) applies it, with the setting `game.chatMaxLength`.
