---
type: Decision
title: Talking, smileys and waves animate as Holo did
description: After each line a speaker shows talk for (letters + 50) x 30 ms; a smiley in chat or a shout shows its face for 5 s; a wave lasts 1.5 s and stops a dance. The room's clock ends each.
status: accepted
timestamp: 2026-11-10T18:05:15+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-10T18:05:15+00:00"}
tags: [server, rooms, chat]
---

# Decision

- After each chat, shout or whisper, the speaker's status shows `talk` for (letters + 50) x 30 ms, which moves its
  mouth.
- A smiley in a chat or a shout shows its face for 5 seconds, as Holo's `checkEmotion` did: `:)` and `:D` `gest sml`;
  `>:(`, `:@` and `:/` `gest agr`; `:(` and `:'(` `gest sad`; `:o`, `:O` and `:0` `gest srp`.
- A wave, `wave`, lasts 1.5 seconds and stops a dance.
- The room's clock ([0072](/decisions/0072-each-loaded-room-runs-its-own-clock.md)) ends each on its tick.

# Context

The client moves a habbo's mouth only while its status says `talk`. Offered Holo's animations, talk and wave only, or
wave only, the user chose "As Holo (Recommended)": "After each line the speaker's mouth moves for (letters + 50) x 30
ms. A smiley in chat or a shout (:) :D, >:( :@ :/, :( :'(, :o :O :0) shows that face for 5 s. A wave lasts 1.5 s and
stops a dance. The room's clock ends each one on its tick. Example: 'hi :)' moves the mouth for 1.6 s and smiles for 5
s."

# Consequences

- [s4-05](/tasks/s4-05-chat-and-gestures.md) applies it.
