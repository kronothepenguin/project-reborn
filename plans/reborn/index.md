---
okf_version: "0.2"
---

# Project Reborn

Everything that is planned for Project Reborn from 2026-11-13 on: the hotel's features, each as a slice across the
store, the game server, the site, housekeeping, the installer and the client
([0001](/decisions/0001-plans-are-feature-slices-in-one-bundle.md)). What was built before is in the history bundles
`plans/holo-port`, `plans/server` and `plans/client`.

## Resume here

1. Read the [rules](/rules.md).
2. Run the board, which prints what is in progress, what waits to be merged and what is ready to start: `python3 -I
   .agents/skills/tracking-plans/scripts/board.py`.
3. Read the newest entries of the [log](/log.md).

## Now

The first feature, end to end ([0010](/decisions/0010-slices-follow-the-hotels-features.md)): a habbo in a room of the
client opened from the site, whose look and motto, changed on the site, change in the client at once.

- [Habbos](/slices/habbos.md): the first service, `Habbos.SendLook`
  ([0005](/decisions/0005-the-game-hears-live-changes-through-services.md),
  [0013](/decisions/0013-a-habbos-look-and-motto-reach-the-game-at-once.md)).
- [Platform](/slices/platform.md): reborn's core comes first (platform-02 and platform-03), for habbos; then the
  installer inside reborn, settings read from the store, the stop in order, one dev server and the releases.
- [The client](/slices/client.md): the spike and the client page, for habbos.

## Next

The order is a proposal until the user confirms it. A slice starts once its open questions are answered.

1. [Assets out of the repository](/slices/assets.md), before the next push
   ([0011](/decisions/0011-no-habbo-files-in-the-repository.md)).
2. [Look and feel](/slices/look-and-feel.md) and [the installer](/slices/installer.md), which depend on nothing.
3. The hotel's features, each with its service when the game must show it live: [economy](/slices/economy.md),
   [club](/slices/club.md), [rooms](/slices/rooms.md), [navigator](/slices/navigator.md),
   [messenger](/slices/messenger.md), [furnis](/slices/furnis.md), [presence and rooms](/slices/presence-and-rooms.md)
   and [moderation](/slices/moderation.md).
4. [Badges and achievements](/slices/badges-and-achievements.md), [extras](/slices/extras.md) and [instant
   games](/slices/games.md).

[r18](/slices/r18.md) is parked.

## Contents

- [Rules](/rules.md) — How slices, tasks, decisions and log entries are created and kept up to date, and how a
  coordinator and its sub-agents share the work.
- [Slices](/slices/index.md) — The features, each across every project it touches.
- [Tasks](/tasks/index.md) — Every task, by slice.
- [Decisions](/decisions/index.md) — What the user decided, from 0001.
- [Reference](/reference/index.md) — The studies the slices read.
- [Log](/log.md) — Decisions, slices and merges, newest first.

## The user's ground rules

They are in `AGENTS.md` at the root of the repository, and win over everything here: no environment variables unless
asked; no decision over architecture, the plan is followed and anything not on it is asked; nothing assumed; no comment
that restates the code; no work on `main`; and `apps/**/cmd/**` is the user's own.
