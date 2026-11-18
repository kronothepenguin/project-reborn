---
type: Task
title: Demonstrate the hotel status on a real hotel
description: The whole feature runs on a real hotel under reborn and with the programs apart, with screenshots, and the documents say what is built.
scope: [knowledge]
depends_on: [06-browser-suite]
skills: [testing-behaviours, documenting-with-okf]
---

# Goal

The user sees the feature work, and the knowledge says so.

# Context

- [Spec](/features/hotel-status/spec.md)
- [Plan](/features/hotel-status/plan.md): the contract is the user's, build it exactly as written there.
- The habbos exit check's scripts, while its folder lasts:
  `/tmp/claude-1000/-mnt-media-Projects-habbo/5838a8a3-d542-499e-90bf-949c857d87fb/scratchpad/habbos-06/scripts/`.
- The client's files and the player of the main checkout (`/mnt/media/Projects/habbo/assets` and
  `packages/cms/public/libreshockwave`), read only; your hotel lives in a temporary folder on free ports.

# Steps

- [ ] Under reborn, two habbos in one room: one page of the site shows both online; staff choose Hotel Closed; both
  clients show the notice and close; the site shows offline, Hotel Closed and both habbos offline; Online Users is
  empty; staff open the hotel; a habbo enters again. Screenshots of each step.
- [ ] The same with the programs apart, then with the game's program ended: the site shows offline within 1 second a
  page, and housekeeping says the game gives no answer.
- [ ] Restart reborn with the hotel closed: the doors stay closed.
- [ ] Root `make check` and `make e2e`.
- [ ] Report the steps for the user to repeat on their own hotel, and every fault as a finding.

# Checks

```sh
make check
make e2e
```
