---
type: Decision
title: A habbo's look and motto reach the game at once, from wherever they change
description: The site's looks and motto pages and housekeeping's habbo editor tell the game through the Habbos service, and the game shows the habbo's new look and motto to it and to its room at once.
status: accepted
timestamp: 2026-11-13T15:20:00-05:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-13T15:20:00-05:00"}
tags: [habbos, services, server, cms, housekeeping]
---

# Decision

- Every place that changes a habbo's figure, gender or motto tells the game after it saves: the CMS's looks, profile and
  motto pages, and housekeeping's habbo editor. They call `Habbos.SendLook(ctx, avatarID)`, the first service of
  [0005](/decisions/reborn/0005-the-game-hears-live-changes-through-services.md).
- The game reads the habbo again; when it is online, the game updates the copy it holds and sends the new look and motto
  to the habbo and to everyone in its room, with the client's own messages.
- Any room will do for the first demonstration.

# Context

The user: "create a room where i can see my habbo and allow me to go into cms, open the client, get into a room in the
client, then if i modify my look in the cms, the client (server) should reflect that." Asked which changes reach the
game, the user chose "Look and motto, from anywhere". On the room: "it does not matter really. any room."

# Consequences

- Holo's MUS did the same with `UPRA`; here the call carries the habbo's id only, and the game reads the store.
