---
type: Slice
title: Habbos
description: A habbo stands in a room of the client opened from the site, and its look and motto, changed on the site or in housekeeping, change in the client at once, through the first service.
status: active
projects: [services, server, cms, housekeeping, reborn, store, config]
depends_on: [platform, client]
from: ["plans/server/phases/s9-site-changes.md"]
timestamp: 2026-11-13T15:20:00-05:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-13T15:20:00-05:00"}
tags: [habbos, services, look]
---

# Goal

The user: "create a room where i can see my habbo and allow me to go into cms, open the client, get into a room in the
client, then if i modify my look in the cms, the client (server) should reflect that."

A signed-in habbo opens the client from the site under reborn, enters any room, and sees itself. Its look and motto,
changed on the site or in housekeeping, change in the client at once, for it and for everyone in the room
([0013](/decisions/0013-a-habbos-look-and-motto-reach-the-game-at-once.md)). It is the first service
([0005](/decisions/0005-the-game-hears-live-changes-through-services.md)).

# Scope

| Project | Part |
| --- | --- |
| `packages/services` | The contracts' package and its first contract, `Habbos.SendLook(ctx, avatarID)` |
| `packages/server` | `SendLook`: reads the habbo again and shows its look and motto to it and its room; its `/api/` for programs run apart |
| `packages/cms`, `packages/housekeeping` | `Inject`; the looks, profile and motto pages and the habbo editor call the service after they save |
| `packages/reborn` | The memory API: the game's instance injected into the site and housekeeping |
| `packages/store`, `packages/config` | The `api_secret` table and its query; `server.api` |

Reborn's core comes from [platform](/slices/platform.md), and the client page from [the client](/slices/client.md).

# Exit criteria

- Under reborn, a signed-in habbo opens the client from the site, enters a room and sees its habbo.
- A look saved on the site's looks page shows in the client at once, for the habbo and for another habbo in the room; so
  does a motto saved on the motto or profile pages, and a look or motto saved in housekeeping's habbo editor.
- With the separate programs, the same changes reach the game through its `/api/`, and the `/api/` answers 404 without
  the secret.
- Every gate passes.

# Tasks

1. [habbos-01 The services package, the Habbos contract and Inject](/tasks/habbos-01-services-and-inject.md)
2. [habbos-02 The game sends a habbo's new look and motto](/tasks/habbos-02-the-game-sends-a-new-look.md)
3. [habbos-03 The site and housekeeping tell the game](/tasks/habbos-03-the-site-tells-the-game.md)
4. [habbos-04 reborn passes the game to the site and housekeeping](/tasks/habbos-04-reborn-wires-the-memory-api.md)
5. [habbos-05 The game's /api/ for programs run apart](/tasks/habbos-05-the-games-api.md)
6. [habbos-06 Check the exit criteria](/tasks/habbos-06-exit-check.md)
