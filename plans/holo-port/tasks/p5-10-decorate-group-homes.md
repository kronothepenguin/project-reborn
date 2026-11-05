---
type: Task
title: Decorate a group's home
description: GET /groups/{id}/edit opens the home editor on a group's home for its admins, the store and inventory place items there with the Group Members widget, and a removed item goes back to the member who placed it.
status: done
phase: p5
depends_on: [p5-07]
packages: [packages/cms, packages/store, tests/e2e]
holo: [source/holo/group_profile.php, source/holo/store.php, source/holo/savehome.php, source/holo/widget_add.php, source/holo/widget_delete.php, source/holo/delete_sticker.php, source/holo/delete_stickie.php, source/holo/edit_widget.php, source/holo/edit_stickie.php]
timestamp: 2026-11-05T21:26:02+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T19:06:47+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-05T21:26:02+00:00"}
---

# Goal

Admins decorate their group's home with [P3](/phases/p3-homes.md)'s editor
([0083](/decisions/0083-group-home-items-return-to-members.md),
[0086](/decisions/0086-roles-and-posts-follow-the-active-habbo.md),
[0098](/decisions/0098-group-home-notes-go-back-to-their-placers.md)).

# Steps

- [x] `GET /groups/{id}/edit` for an admin's active habbo; anyone else goes to the group page, as Holo bounced them.
- [x] The `/homes/{id}/...` changes accept a group's home for its admins, with the items of the admin's inventory.
- [x] The inventory's Widgets tab offers `Group Members` on a group's home, once, beside Holo's greyed-out widgets.
- [x] Removing a sticker another member placed returns it to that member's user, with Holo's warning; the Group
  information widget goes back to its corner, as the profile widget does.
- [x] Go tests, and the `groups` browser suite decorates a group's home.

# Verification

```sh
# gofmt, go vet and go test -race in packages/cms and packages/store
cd tests/e2e && node run.mjs groups homes
```

Results (2026-11-05T21:26:02+00:00):

- `gofmt`, `go vet` and `go test -race` pass in the whole of `packages/cms` and `packages/store`; `make check-docs`
  passes; `pnpm build` passes, and `svelte-check` finds nothing new in the changed components.
- The CMS tests open the edit page for the owner and an admin, send a member, a waiting admin, the owner's other habbo
  and a guest away, and answer 404 for a missing group. The skins follow `group_profile.php`'s order, with the club and
  staff skins in their places. An admin places, moves and saves a sticker from their own inventory; a member, an
  outsider and a guest are refused. Group Members goes on once, at 20 and 20, within `homes.maxItems` and the
  playground, and only on a group's home. Removed stickers and notes go back to their placers, the remover's own note
  too, and to the remover when nobody is recorded; a note removed from a habbo's home is still gone. The Group
  information widget goes back to its corner. The edit page marks the items another user placed, not those of the
  admin's other habbo, nor widgets.
- `node run.mjs groups homes` passes all 100 checks (66 and 34). The ten new ones follow Admin-1 from `Modify page` into
  the edit mode of Quiet Corner, through the Group information widget's menu without Remove, Holo's warning on Dora's
  sticker and its return to her, Admin-1's note without the deleted-for-good warning, Group Members placed with the
  group's members and greyed out after, his own sticker, and Save; and the homes suite now checks the note warning on a
  habbo's home. The screenshots `group-edit-warning`, `group-decorating` and `group-decorated` were read by eye.
- Breaking these on purpose fails a test: the admin check of the home, of the helper and of the edit page, the skin
  order, the editor given to the page, the marks on widgets and without an editor, notes returned from every home or
  from none, the placer replaced by the remover, the missing placer, the Group information widget left out, the
  widget counted twice, the limit, the widget list, the widget's place and height checks; in the browser, the note
  warning shown on group homes and hidden everywhere, Remove on the Group information widget, the greyed-out widget,
  the marks on the page and the placed widget's ids.

# Notes

- `store.php`'s other widgets are commented out, so on a group's home the Widgets tab offers `Group Members` alone,
  greyed out once placed: that is what this task's "greyed-out widgets" meant.
- Asked where a note removed from a group home goes, the user chose its placer
  ([0098](/decisions/0098-group-home-notes-go-back-to-their-placers.md)).
- Holo puts a placed widget at 20 and 20, above the Group information widget at 25 and 25, as here.
- The edit page holds Group Members in a `<template>`, so a placed widget looks as the page draws it, members included,
  without leaving the page or losing the moves not yet saved.

