---
type: Plan
title: "Habbos: how"
description: The services package carries a habbo's new look from the site and housekeeping to the game, in reborn and over the game's /api/.
---

# Architecture

| Project | Part |
| --- | --- |
| `packages/services` | The contracts' package and its first contract, `Habbos.SendLook(ctx, avatarID)` |
| `packages/server` | `SendLook`: reads the habbo again and shows its look and motto to it and its room; its `/api/` for programs run apart |
| `packages/cms`, `packages/housekeeping` | `Inject`; the looks, profile and motto pages and the habbo editor call the service after they save |
| `packages/reborn` | The memory API: the game's instance injected into the site and housekeeping |
| `packages/store`, `packages/config` | The `api_secret` table and its query; `server.api` |

Reborn's core comes from [platform](/features/platform/spec.md), and the client page from [the
client](/features/client/spec.md).

# Decisions

- [The game hears of live changes through
  services](/decisions/reborn/0005-the-game-hears-live-changes-through-services.md) — Changes the game must show at once
  reach it through small contracts in packages/services, injected into the apps after New; reborn passes in-memory
  implementations, programs run apart call the game's /api/ over HTTP with a secret; calls carry ids only and store
  nothing.
- [A habbo's look and motto reach the game at once, from wherever they
  change](/decisions/reborn/0013-a-habbos-look-and-motto-reach-the-game-at-once.md) — The site's looks and motto pages
  and housekeeping's habbo editor tell the game through the Habbos service, and the game shows the habbo's new look and
  motto to it and to its room at once.
