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

- [Platform](/slices/platform.md): [platform-01](/tasks/platform-01-drop-the-unused-listener.md) is ready to start. The
  orchestrator and the notices wait for the user's answers to its open questions.

## Next

The order is a proposal until the user confirms it. A slice starts once its open questions are answered.

1. [Look and feel](/slices/look-and-feel.md) and [the installer](/slices/installer.md), which depend on nothing and
   touch different packages, beside platform.
2. [Friends and the messenger](/slices/friends.md), the next feature of the game.
3. [Presence and rooms](/slices/presence-and-rooms.md), [credits and club](/slices/credits-and-club.md),
   [moderation](/slices/moderation.md) and [furni and the catalogue](/slices/furni-and-catalogue.md), which need
   platform's notices.
4. [Badges and achievements](/slices/badges-and-achievements.md), [extras](/slices/extras.md), [instant
   games](/slices/games.md) and [the client](/slices/client.md).

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
