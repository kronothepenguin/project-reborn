---
type: Note
title: Next features
description: The active features, and the proposed order of the rest.
---

# Active

The first feature runs end to end ([0010](/decisions/reborn/0010-slices-follow-the-hotels-features.md)): a habbo in a
room of the client opened from the site, whose look and motto, changed on the site, change in the client at once.

- [Habbos](/features/habbos/spec.md): the first service, `Habbos.SendLook`
  ([0005](/decisions/reborn/0005-the-game-hears-live-changes-through-services.md),
  [0013](/decisions/reborn/0013-a-habbos-look-and-motto-reach-the-game-at-once.md)).
- [Platform](/features/platform/spec.md): reborn's core comes first (tasks 02 and 03), for habbos; then the installer
  inside reborn, settings read from the store, the stop in order, one dev server and the releases.
- [The client](/features/client/spec.md): the spike and the client page, for habbos.

# Next

This order is a proposal until the user confirms it. A feature starts once its open questions are answered.

1. [Assets out of the repository](/features/assets/spec.md), before the next push
   ([0011](/decisions/reborn/0011-no-habbo-files-in-the-repository.md)).
2. [Look and feel](/features/look-and-feel/spec.md) and [the installer](/features/installer/spec.md), which depend on
   nothing.
3. The hotel's features, each with its service when the game must show it live: [economy](/features/economy/spec.md),
   [club](/features/club/spec.md), [rooms](/features/rooms/spec.md), [navigator](/features/navigator/spec.md),
   [messenger](/features/messenger/spec.md), [furnis](/features/furnis/spec.md),
   [presence and rooms](/features/presence-and-rooms/spec.md) and [moderation](/features/moderation/spec.md).
4. [Badges and achievements](/features/badges-and-achievements/spec.md), [extras](/features/extras/spec.md) and
   [instant games](/features/games/spec.md).

[r18](/features/r18/spec.md) is parked.
