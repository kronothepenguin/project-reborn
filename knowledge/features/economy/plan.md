---
type: Plan
title: "Economy: how"
description: An Economy service tells the game of credits, tickets and film changed by housekeeping and the site.
---

# Architecture

| Project | Part |
| --- | --- |
| `packages/services` | The `Economy` service: `SendCredits(ctx, userID)`, and tickets and film ([0005](/decisions/reborn/0005-the-game-hears-live-changes-through-services.md)) |
| `packages/housekeeping` | Gives and takes credits, tickets and film; tells the game |
| `packages/cms` | Vouchers, groups and the home store spend or give credits; tells the game |
| `packages/server` | Sends a player its new balance at once |

Today a change of credits on the site shows in the game at the player's next purchase or login. Club is
[its own feature](/features/club/spec.md).

# Decisions

- [The game hears of live changes through
  services](/decisions/reborn/0005-the-game-hears-live-changes-through-services.md) — Changes the game must show at once
  reach it through small contracts in packages/services, injected into the apps after New; reborn passes in-memory
  implementations, programs run apart call the game's /api/ over HTTP with a secret; calls carry ids only and store
  nothing.
- [Slices follow the hotel's own features, and habbos comes
  first](/decisions/reborn/0010-slices-follow-the-hotels-features.md) — The economy and club are separate slices, furni
  with its catalogue is furnis, friends is the messenger, and habbos, rooms and navigator are slices of their own; the
  habbos slice is the first feature built, end to end from the site to the client.
