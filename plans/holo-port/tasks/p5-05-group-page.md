---
type: Task
title: Show a group's home
description: GET /groups/{id} shows a group's home as Holo's group_profile.php, with its stickers, notes, Group information and Group Members widgets, and a missing group gets Holo's page with the group search.
status: done
phase: p5
depends_on: [p5-02, p5-03]
packages: [packages/cms, tests/e2e]
holo: [source/holocms/group_profile.php]
timestamp: 2026-11-05T20:19:16+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T19:06:47+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-05T20:19:16+00:00"}
---

# Goal

Anyone reads a group's home, as on Holo's `group_profile.php` ([0017](/decisions/0017-guest-read-access.md),
[0081](/decisions/0081-groups-have-four-types.md), [0095](/decisions/0095-group-search-and-report-addresses.md)).

# Steps

- [x] `GET /groups/{id}`: the name with the Exclusive or Private icon, the home's background, stickers and notes.
- [x] The Group information widget: the badge, the name, `Created:`, the members and the description.
- [x] The Group Members widget: the admins first, with the owner and admin icons, then the members, with the favourite
  icon.
- [x] A missing group shows Holo's `Page not found!` with `Search for group`, and `GET /groups?name=` opens the
  group with exactly that name or shows Holo's no-results line.
- [x] Viewing changes nothing: no request is removed and no widget is written.
- [x] Go tests, and the `groups` browser suite reads a group's home and the search.

# Verification

```sh
# gofmt, go vet and go test -race in packages/cms
cd tests/e2e && node run.mjs groups
```

Results (2026-11-05T20:19:16+00:00):

- `gofmt`, `go vet` and `go test -race` pass in the whole of `packages/cms`; `pnpm build` builds `groups/id.html` and
  `groups/not-found.html`.
- `node run.mjs homes groups me` passes all 94 checks. `groups` gains ten, as a guest:
  - the page is named after the group, the header still names the hotel, and a Regular group shows no icon while a
    Private one shows Holo's closed icon;
  - the Group information widget shows the badge as the CMS draws it, the name, `Created:` in Holo's format, the
    members and the text;
  - the Group Members widget lists the owner first with Holo's owner icon, then a member with the favourite mark and
    a link to his home;
  - the widgets stand where they were placed, on the 922-pixel playground;
  - a missing group answers 404 with Holo's page and its search, a search that finds nothing says so and keeps the
    name, and a search ignoring case opens the group.
  The screenshots `group-home` and `group-missing` were read by eye.
- The CMS tests find the page's data: the icons, Holo's default background, the information, the members admins
  first without requests or archived habbos, the items with the note in BBCode; a viewer's request and the home's items
  untouched by a view; and the search, exact but ignoring case, with `%` and `_` as plain characters.
- Breaking these on purpose fails a test: the Private icon on Exclusive groups, every admin as owner, the search's
  line dropped, the habbo date in place of Holo's full date, the widget cut to two members, an empty name taken as no
  search, and a missing group answering 200.

# Notes

- The first screenshot showed the header saying `Retro Club is offline`: the page's `Name` hid the layout's. The
  field is now `Group`, and `TestNoPageHidesAFieldOfTheLayout` guards both group pages; it failed before the rename.
- `home-view.astro` takes the page's header in a slot, and draws the two group widgets beside the profile widget.
  The item and background helpers are shared with the habbo's home.
- The Group information widget and the Group Members widget have Holo's sizes for every skin, from `skins.css`.
- Holo's member widget had no working pages and listed every member; so does this one.
- The playground's width needed [p5-21](/tasks/p5-21-home-playground-widths.md), found here.
- Holo's group icons are copied under `packages/cms/public/web-gallery/images`, and `info_icons.png` under
  `web-gallery/v2/images`, at Holo's paths.

