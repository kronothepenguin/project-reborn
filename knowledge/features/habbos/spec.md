---
type: Spec
title: Habbos
description: A habbo stands in a room of the client opened from the site, and its look and motto, changed on the site or in housekeeping, change in the client at once, through the first service.
status: active
projects: [packages/services, packages/server, packages/cms, packages/housekeeping, packages/reborn, packages/store, packages/config]
---

# What

The user: "create a room where i can see my habbo and allow me to go into cms, open the client, get into a room in the
client, then if i modify my look in the cms, the client (server) should reflect that."

A signed-in habbo opens the client from the site under reborn, enters any room, and sees itself. Its look and motto,
changed on the site or in housekeeping, change in the client at once, for it and for everyone in the room
([0013](/decisions/reborn/0013-a-habbos-look-and-motto-reach-the-game-at-once.md)). It is the first service
([0005](/decisions/reborn/0005-the-game-hears-live-changes-through-services.md)).

It builds on [platform](/features/platform/spec.md) and [the client](/features/client/spec.md).

# Behaviours

- Under reborn, a signed-in habbo opens the client from the site, enters a room and sees its habbo.
- A look saved on the site's looks page shows in the client at once, for the habbo and for another habbo in the room; so
  does a motto saved on the motto or profile pages, and a look or motto saved in housekeeping's habbo editor.
- With the separate programs, the same changes reach the game through its `/api/`, and the `/api/` answers 404 without
  the secret.
