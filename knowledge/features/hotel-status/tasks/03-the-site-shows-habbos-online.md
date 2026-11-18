---
type: Task
title: Show each habbo online or offline on the site
description: The profile widget, the community page, the staff page and the forum posts show the online picture beside a habbo that is in the hotel.
scope: [packages/cms]
depends_on: [01-the-game-starts-stops-and-answers]
skills: [applying-go-patterns, templating-astro-pages, building-astro-components, testing-behaviours, use-modern-go]
---

# Goal

The last behaviour under "The site" of the [spec](/features/hotel-status/spec.md): a page shows a habbo that is in
the hotel with the online picture, on the profile widget, the community page, the staff page and the forum's posts; a
habbo outside the hotel shows the offline picture.

# Context

- [Spec](/features/hotel-status/spec.md)
- [Plan](/features/hotel-status/plan.md): the contract is the user's, build it exactly as written there.
- `packages/cms/src/components/homes/widgets/profile-widget.astro`, `src/pages/staff.astro`,
  `src/components/forum/post.astro` and `post-preview.svelte`, the community page's random habbos; their handlers in
  `packages/cms/internal/router` (`home.go`, `staff.go`, `community.go`, `forum_threads.go`).
- Holo's pages for the pictures and their places: `source/holocms` (Latin-1; read through `iconv`).
- `knowledge/sources/holocms/differences.md`: the row "The online state of the profile widget…", which this task
  removes.
- Task 02 changes the layouts and `hotelStatus` at the same time: keep to the pages and components named here.

# Steps

- [ ] One helper in the router asks `Habbos.AreOnline` once per page for the habbos the page shows, with 1 second; an
  error or no injected game reads as offline for all.
- [ ] The four places show Holo's online picture for a habbo that is online. The forum's post preview shows the
  author as Holo's page meant to: report what you chose.
- [ ] One test per place, through the router, with a test double of `services.Habbos`.
- [ ] Update `packages/cms/knowledge` and the row of `differences.md`.

# Checks

```sh
make -C packages/cms check
```

Then `make check` in every project that `make dependants project=<folder>` prints for `packages/cms`.
