---
type: Spec
title: Presence and rooms on the site
description: "The site and housekeeping show who is in the hotel and where: the online count and states, Online Users, My Rooms, recommended rooms and the first-login room picker."
status: planned
projects: [packages/server, packages/virtual, packages/cms, packages/housekeeping]
---

# What

What only the game server knows shows on the site: how many habbos are online, whether a habbo is, and the rooms it has.

It builds on [platform](/features/platform/spec.md).

# Behaviours

Written with the user when the feature is planned.

# Open questions

- What "online" means on the site: in the hotel now, asked of the game server; or, as Holo meant it, a page of the site
  opened in the last 10 minutes ([the communication
  study](/features/platform/research-communication.md#the-site-asks-the-game-server)).
- What the site shows while the game server is not running.
- Whether the first-login room picker is ported as Holo's `welcome.php`.
- Which of its parts go to [habbos](/features/habbos/spec.md), [rooms](/features/rooms/spec.md) and
  [navigator](/features/navigator/spec.md) ([0010](/decisions/reborn/0010-slices-follow-the-hotels-features.md)).
