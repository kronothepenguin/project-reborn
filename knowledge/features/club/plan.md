---
type: Plan
title: "Club: how"
description: The site and the game sell club, and the game shows a player its club at once.
---

# Architecture

| Project | Part |
| --- | --- |
| `packages/cms` | Sells club; tells the game |
| `packages/server` | Sends a player its club and its rights at once; sells club and its gifts in the client (`hh_club`, `packages/server/knowledge/r26/hh_club.md`) |
| `packages/store` | What club bought in the client needs |

# Decisions

- [Slices follow the hotel's own features, and habbos comes
  first](/decisions/reborn/0010-slices-follow-the-hotels-features.md) — The economy and club are separate slices, furni
  with its catalogue is furnis, friends is the messenger, and habbos, rooms and navigator are slices of their own; the
  habbos slice is the first feature built, end to end from the site to the client.
