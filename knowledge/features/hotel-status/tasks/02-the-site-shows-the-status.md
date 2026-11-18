---
type: Task
title: Show the hotel status on the site
description: Every page of the site shows the count of habbos online and Enter or offline from the game status, the Me page shows Enter or Hotel Closed, and the client page sends a habbo back while the game is stopped.
scope: [packages/cms]
depends_on: [01-the-game-starts-stops-and-answers]
skills: [applying-go-patterns, templating-astro-pages, building-astro-components, testing-behaviours, use-modern-go]
---

# Goal

The first five behaviours under "The site" of the [spec](/features/hotel-status/spec.md): the count and the header
while the game runs; 0 and "is offline" while it is stopped or silent for 1 second; the Me page's button; the client
page's redirect; and "Hotel Closed" in the client's window when it loses its connection while the game is stopped.

# Context

- [Spec](/features/hotel-status/spec.md)
- [Plan](/features/hotel-status/plan.md): the contract is the user's, build it exactly as written there.
- `packages/cms/internal/router/router.go`: `hotelStatus`, which every page's layout reads, and `sendLook`, the form
  of a call to the game with a context of its own.
- `packages/cms/src/layouts/signed-out.astro` and `community.astro`, `src/components/header/enter-hotel.astro` and
  `hotel-status.astro`, `src/components/me/personal-info.astro`.
- Holo's pages for the wording and the guest's Enter link: `source/holocms` (Latin-1; read through `iconv`).
- `packages/cms/knowledge/client.md` and the handler of `/client/utils`: the error page the client's window lands on
  (`/client/utils?key=error&error=disconnect`).
- `knowledge/sources/holocms/differences.md`: the rows "Every page", "Header" and "Me", which this task removes or
  rewrites.

# Steps

- [ ] `hotelStatus` asks `Hotel.Status` once per request, with 1 second, and fills `Online` and `OnlineCount`; an
  error or no injected game reads as stopped.
- [ ] The header shows "Enter <site name>" while the game runs and "<site name> is offline" while it is stopped, for
  guests and habbos; a guest's Enter leads through sign-in to the client.
- [ ] The Me page shows Holo's Enter button while the game runs and "Hotel Closed" while it is stopped.
- [ ] `/client` redirects a habbo to `/me` while the game is stopped.
- [ ] `/client/utils` with the client's disconnect error, while the game is stopped, shows the same card with the
  heading "Hotel Closed" and the text "<site name> is closed at the moment. Please come back later." While the game
  runs it shows the error page as today.
- [ ] One test per behaviour, through the router, with a test double of `services.Hotel`.
- [ ] Update `packages/cms/knowledge` and the three rows of `differences.md`.

# Checks

```sh
make -C packages/cms check
```

Then `make check` in every project that `make dependants project=<folder>` prints for `packages/cms`.
