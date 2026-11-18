---
type: Task
title: Add the Online Users page to housekeeping
description: Housekeeping lists every habbo in the hotel now on Holo's Online Users page.
scope: [packages/housekeeping]
depends_on: [01-the-game-starts-stops-and-answers]
skills: [applying-go-patterns, templating-astro-pages, building-astro-components, testing-behaviours, use-modern-go]
---

# Goal

The last behaviour under "Housekeeping" of the [spec](/features/hotel-status/spec.md): staff with `housekeeping.users`
open Online Users, and Holo's table lists every habbo in the hotel, with the link to edit it; staff without it are
refused.

# Context

- [Spec](/features/hotel-status/spec.md)
- [Plan](/features/hotel-status/plan.md): the contract is the user's, build it exactly as written there.
- Holo's page: `source/holocms/housekeeping/onlinelist.php` (Latin-1; read through `iconv`), and `usermenu.php` for
  its place in the menu.
- `packages/housekeeping/internal/router/habbos.go` and its page: User Listing, whose columns, private fields
  (`housekeeping.usersPrivate`) and Last Activity rule this page follows.
- `knowledge/sources/holocms/housekeeping.md` and `differences.md`: the rows that name `onlinelist` and "Online
  Users" as deferred, which this task rewrites.
- Task 04 changes the settings page and the dashboard at the same time: keep to the new page and the menu.

# Steps

- [ ] `GET /housekeeping/online`, for `housekeeping.users`: the heading "Online Users (N)", and Holo's columns (ID,
  Name with the last IP and WHOIS, E-Mail Address, Join date, Last activity, Edit) for the habbos `Habbos.Online`
  lists, read from the store in one query. The private fields follow User Listing. With no answer from the game the
  table is empty and says so.
- [ ] The menu entry where Holo had it.
- [ ] One test per behaviour, through the router, with a test double of `services.Habbos`.
- [ ] Update `packages/housekeeping/knowledge` and the two source rows.

# Checks

```sh
make -C packages/housekeeping check
```

Then `make check` in every project that `make dependants project=<folder>` prints for `packages/housekeeping`, and the
browser suite `housekeeping-admin`.
