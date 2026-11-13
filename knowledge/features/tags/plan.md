---
type: Plan
title: "Tags: how"
description: The CMS adds tags, draws the cloud and the search, and runs the fight on queries of the store.
---

# Architecture

| Project | Part |
| --- | --- |
| `packages/cms` | `/tags`, `POST /tags`, `POST /tags/fight`, `POST /me/tags`; the tag panel of the profile widget, the Me page's tags habblet, the tag cloud on the community, landing and Me pages, and the tag fight island |
| `packages/store` | The profile tags and their counts |

# Decisions

- [Guests can read public pages](/decisions/holo-port/0017-guest-read-access.md) — Guests read the tags page; acting
  needs a session.
- [Habbos are archived, and the forum shows them as
  archived](/decisions/holo-port/0089-archived-habbos-show-as-archived.md) — An archived habbo is hidden, so its tags
  leave the cloud, the search and the fight.

# Notes

- Holo's float arithmetic for the cloud's sizes gives the same percentages as exact arithmetic for every spread up to
  2000, so the port keeps Holo's formula.
- The island tells the winner of the fight from the two counts, as Holo's page did.
- `POST /tags` and `POST /me/tags` share `addProfileTag`, so both follow the same rules.
