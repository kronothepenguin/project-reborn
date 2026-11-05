---
type: Task
title: Show a group's home
description: GET /groups/{id} shows a group's home as Holo's group_profile.php, with its stickers, notes, Group information and Group Members widgets, and a missing group gets Holo's page with the group search.
status: todo
phase: p5
depends_on: [p5-02, p5-03]
packages: [packages/cms, tests/e2e]
holo: [source/holo/group_profile.php]
timestamp: 2026-11-05T19:06:47+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T19:06:47+00:00"}
---

# Goal

Anyone reads a group's home, as on Holo's `group_profile.php` ([0017](/decisions/0017-guest-read-access.md),
[0081](/decisions/0081-groups-have-four-types.md), [0095](/decisions/0095-group-search-and-report-addresses.md)).

# Steps

- [ ] `GET /groups/{id}`: the name with the Exclusive or Private icon, the home's background, stickers and notes.
- [ ] The Group information widget: the badge, the name, `Created:`, the members and the description.
- [ ] The Group Members widget: the admins first, with the owner and admin icons, then the members, with the favourite
  icon.
- [ ] A missing group shows Holo's `Page not found!` with `Search for group`, and `GET /groups?name=` opens the
  group with exactly that name or shows Holo's no-results line.
- [ ] Viewing changes nothing: no request is removed and no widget is written.
- [ ] Go tests, and the `groups` browser suite reads a group's home and the search.

# Verification

```sh
# gofmt, go vet and go test -race in packages/cms
cd tests/e2e && node run.mjs groups
```
