---
type: Task
title: Decorate a group's home
description: GET /groups/{id}/edit opens the home editor on a group's home for its admins, the store and inventory place items there with the Group Members widget, and a removed item goes back to the member who placed it.
status: todo
phase: p5
depends_on: [p5-07]
packages: [packages/cms, packages/store, tests/e2e]
holo: [source/holo/group_profile.php, source/holo/store.php, source/holo/savehome.php, source/holo/widget_add.php, source/holo/widget_delete.php, source/holo/delete_sticker.php, source/holo/delete_stickie.php, source/holo/edit_widget.php, source/holo/edit_stickie.php]
timestamp: 2026-11-05T19:06:47+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T19:06:47+00:00"}
---

# Goal

Admins decorate their group's home with [P3](/phases/p3-homes.md)'s editor
([0083](/decisions/0083-group-home-items-return-to-members.md),
[0086](/decisions/0086-roles-and-posts-follow-the-active-habbo.md)).

# Steps

- [ ] `GET /groups/{id}/edit` for an admin's active habbo; anyone else goes to the group page, as Holo bounced them.
- [ ] The `/homes/{id}/...` changes accept a group's home for its admins, with the items of the admin's inventory.
- [ ] The inventory's Widgets tab offers `Group Members` on a group's home, once, beside Holo's greyed-out widgets.
- [ ] Removing a sticker another member placed returns it to that member's user, with Holo's warning; the Group
  information widget goes back to its corner, as the profile widget does.
- [ ] Go tests, and the `groups` browser suite decorates a group's home.

# Verification

```sh
# gofmt, go vet and go test -race in packages/cms and packages/store
cd tests/e2e && node run.mjs groups homes
```
