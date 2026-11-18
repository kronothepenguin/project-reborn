---
type: Task
title: Let staff start and stop the game in housekeeping
description: The settings page gains the form Turn your hotel on/off with the game status, saving it or the site switch starts or stops the game, and the dashboard shows the habbos online.
scope: [packages/housekeeping]
depends_on: [01-the-game-starts-stops-and-answers]
skills: [applying-go-patterns, templating-astro-pages, testing-behaviours, use-modern-go]
---

# Goal

The first six behaviours under "Housekeeping" of the [spec](/features/hotel-status/spec.md): Hotel Closed stops the
game for good; opening starts it; maintenance stops it and its end starts it unless the hotel is closed; the form
shows the status or that the game gives no answer; a save while the game is silent is kept; the dashboard's count.

# Context

- [Spec](/features/hotel-status/spec.md)
- [Plan](/features/hotel-status/plan.md): the contract is the user's, build it exactly as written there.
- `packages/housekeeping/internal/router/settings.go`: the form "Turn your site on/off" (`site.maintenance`), the
  model of the new form, and how a form saves.
- `packages/housekeeping/internal/router/index.go`: the dashboard. Holo's dashboard for the count's place and
  wording: `source/holocms/housekeeping` (Latin-1; read through `iconv`).
- `knowledge/sources/holocms/differences.md`: the row "Dashboard", which this task rewrites.
- Task 05 adds a page to housekeeping at the same time: keep to the settings page and the dashboard.

# Steps

- [ ] The form "Turn your hotel on/off" under "Turn your site on/off", with the field "Close Hotel" (`game.closed`),
  for `housekeeping.settings`. Above its field it says whether the game runs and how many habbos are inside, or "The
  game server gives no answer."
- [ ] After either switch is saved, housekeeping calls `Hotel.Stop` when the save closed something, and `Hotel.Start`
  when it opened something, with a context of its own of 5 seconds. A failure is logged and the save stands.
- [ ] The dashboard shows the online count beside Members, as Holo's did.
- [ ] One test per behaviour, through the router, with a test double of `services.Hotel` that records its calls.
- [ ] Update `packages/housekeeping/knowledge`, the settings list of `knowledge/features/hotel-settings` where it
  names the forms, and the row of `differences.md`.

# Checks

```sh
make -C packages/housekeeping check
```

Then `make check` in every project that `make dependants project=<folder>` prints for `packages/housekeeping`, and the
browser suites `housekeeping-settings` and `housekeeping-admin`, which count forms and fields.
