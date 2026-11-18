---
type: Task
title: Prove the hotel status in a browser suite
description: The suite hotel-status proves, across the site, housekeeping and the game, that stopping the game in housekeeping shows on the site and that starting it brings Enter back.
scope: [tests/e2e]
depends_on: [02-the-site-shows-the-status, 03-the-site-shows-habbos-online, 04-staff-start-and-stop-the-game, 05-online-users]
skills: [testing-behaviours]
---

# Goal

What crosses programs in the [spec](/features/hotel-status/spec.md), in real browsers: the page texts of the site and
of housekeeping while the game runs and while it is stopped, and the switch's effect from one program to the other.

# Context

- [Spec](/features/hotel-status/spec.md)
- [Plan](/features/hotel-status/plan.md): the contract is the user's, build it exactly as written there.
- `tests/e2e/knowledge`: the rules of a run, the harness that starts the game server, expected log lines.
- The suites `client`, `housekeeping-settings` and `me`, for their forms.

# Steps

- [ ] A suite `hotel-status`: the header's count, picture and "Enter <site name>" while the game runs; staff choose
  Hotel Closed; the site shows 0, "is offline" and "Hotel Closed" on Me, `/client` leads to Me, and the form says the
  game is stopped; staff open the hotel; Enter is back. The same through the site's maintenance switch. The suite
  ends with the hotel open.
- [ ] The log lines the game writes when it stops and starts are listed as the suite expects them.
- [ ] Run the suite ten times, then the whole of `make e2e`.

# Checks

```sh
make e2e
```
