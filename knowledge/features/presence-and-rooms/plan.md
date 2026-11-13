---
type: Plan
title: "Presence and rooms on the site: how"
description: The game answers the site's questions about who is online and where.
---

# Architecture

| Project | Part |
| --- | --- |
| `packages/server` | Answers the site's questions: the online count, where a habbo is |
| `packages/cms` | The online count and the hotel's status on every page; the online state on the profile widget, the community page, the staff page and the forum's posts; My Rooms and the recommended rooms; `welcome.php`, the room picker of a first login |
| `packages/housekeeping` | Online Users; the online count beside Members on the dashboard |

All of it was deferred by [holo-port 0013](/decisions/holo-port/0013-defer-game-server-features.md) and is listed under
"Waiting for a later phase" in [Holo's differences](/sources/holocms/differences.md). The game server learning that a
habbo was archived on the site ([later](/features/platform/later.md)) is answered with
[platform](/features/platform/spec.md)'s notices.

# Decisions

- [Slices follow the hotel's own features, and habbos comes
  first](/decisions/reborn/0010-slices-follow-the-hotels-features.md) — The economy and club are separate slices, furni
  with its catalogue is furnis, friends is the messenger, and habbos, rooms and navigator are slices of their own; the
  habbos slice is the first feature built, end to end from the site to the client.
