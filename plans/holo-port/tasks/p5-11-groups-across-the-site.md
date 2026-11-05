---
type: Task
title: Show groups across the site
description: The header's My Groups menu, the MY GROUPS widget of habbo homes with its group info, and the favourite group's badge on the profile widget and the staff page show a habbo's groups as in Holo.
status: done
phase: p5
depends_on: [p5-04, p5-10]
packages: [packages/cms, packages/store, tests/e2e]
holo: [source/holo/quickmenu.php, source/holo/user_profile.php, source/holo/groupinfo.php, source/holo/staff.php, source/holo/templates/community/header.php]
timestamp: 2026-11-05T21:57:29+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T19:06:47+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-05T21:57:29+00:00"}
---

# Goal

A habbo's groups show where Holo showed them, which [P2](/phases/p2-me-account.md), [P3](/phases/p3-homes.md) and
[P4](/phases/p4-community.md) left for P5.

# Steps

- [x] The header's `My Groups` for signed-in visitors: `GET /me/groups` lists the active habbo's groups with the
  favourite, admin and owner marks, as `quickmenu.php?key=groups`.
- [x] The `MY GROUPS` widget: placed once from the Widgets tab, it lists the habbo's groups with badges and marks,
  and `GET /groups/{id}/info` fills its info box, as `groupinfo.php`.
- [x] The profile widget and the staff page show the favourite group's badge, linking to the group.
- [x] The rows waiting for P5 leave the [differences](/reference/holo-differences.md).
- [x] Go tests, and the `groups`, `homes` and `staff` browser suites check them.

# Verification

```sh
# gofmt, go vet and go test -race in packages/cms and packages/store
cd tests/e2e && node run.mjs groups homes staff
```

Results (2026-11-05T21:57:29+00:00):

- `gofmt`, `go vet` and `go test -race` pass in the whole of `packages/cms` and `packages/store`; `pnpm build` passes,
  `svelte-check` finds nothing new, and every community page's first island stands outside any `[[ if ]]`.
- The CMS tests list the active habbo's groups for the menu with the memberships before the admin roles, ten at most,
  with the favourite, admin and owner marks, and the purchase limits with the purse; another habbo of the user gets
  its own, and a guest 401. The info box answers anyone with the group's name, badge, Holo's date and description, and
  404 for a missing group. MY GROUPS goes on a habbo's home once, and Group Members does not. A home lists its habbo's
  joined groups with their marks, and the profile widget and the staff page carry the favourite group.
- `node run.mjs groups homes staff` passes all 123 checks (74, 36 and 13). The new ones find no `My Groups` for a guest;
  open Frank's menu with Holo's heart and star, its links and its `Create a group`, which opens the purchase dialog
  knowing buying is off; find his favourite's badge on his profile; place MY GROUPS from the Widgets tab, list his groups
  with their marks, open a group's info box, close it with the minus, and open one from a badge without leaving the
  home; offer My Groups alone on Admin-1's home; and show Frank's favourite group's badge after his worn one on the staff
  page. The screenshots `quick-menu-groups`, `groups-widget-info` and `staff` were read by eye.
- Breaking these on purpose fails a test: the menu's order, its limit, the admin and owner marks, the purse, the habbo
  asked, the info box's date and its 404, the widget's marks, the home's groups, the profile's and the staff page's
  favourite, the widget a habbo's home takes and its place; in the browser, the badge click, the menu shown to guests,
  the favourite mark, the list's loading, the store's MY GROUPS, the purchase dialog's own ids and the info box's minus.

# Notes

- Two purchase dialogs can now share a page, the header's and the Me page's, and the group settings dialog shares the
  group page with the header's; each takes its ids from `$props.id()`, since a label found the first `group_name`.
- `quickmenu.php` sorts by `member_rank`, so the memberships come before the admin roles and the ten-row limit can leave
  admin roles out, as here.
- Holo's quick menu and widget show the owner's star and the favourite's heart of `info_icons.png`; the titles are
  Holo's `Favourite`, `Admin` and `Owner`, unlike the Group Members widget's `Favorite` and `Administrator`.
- `My Friends` and `My Rooms` stay away with the game server, so the header holds `My Groups` alone.

