---
type: Task
title: Change and delete a group
description: A group's admins get Holo's Edit menu, and its owner's Settings change the name, description and type with Holo's confirmations or delete the group, whose home's items go back to the members who placed them.
status: done
phase: p5
depends_on: [p5-06]
packages: [packages/cms, tests/e2e]
holo: [source/holo/group_profile.php, source/holo/group_settings.php, source/holo/update_group_settings.php, source/holo/groups_delete_group.php, source/holo/groups_confirm_delete_group.php]
timestamp: 2026-11-05T20:37:49+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T19:06:47+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-05T20:37:49+00:00"}
---

# Goal

Owners run their groups as on Holo's group page ([0081](/decisions/0081-groups-have-four-types.md),
[0083](/decisions/0083-group-home-items-return-to-members.md), [0084](/decisions/0084-group-names-and-descriptions.md),
[0086](/decisions/0086-roles-and-posts-follow-the-active-habbo.md)).

# Steps

- [x] The `Edit` button and its menu while the habbo holding the role is active: `Modify page`, `Settings` for
  the owner, `Badge` and `Members`.
- [x] ⚡`groups/group-settings`: Holo's dialog with the name, the text and its counter from 200, the four types with
  their texts, Unlimited locked once chosen, Holo's confirmations, `Save changes`, `Delete group` and `Cancel`.
- [x] `POST /groups/{id}/settings` for the owner answers as `update_group_settings.php`, refuses a taken name, and
  removes the waiting requests when the type leaves Exclusive.
- [x] `POST /groups/{id}/delete`, after Holo's warning, deletes the group, its memberships and its home, and returns
  the home's stickers and notes to the users whose habbos placed them.
- [x] Go tests, and the `groups` browser suite changes and deletes a group.

# Verification

```sh
# gofmt, go vet and go test -race in packages/cms
cd tests/e2e && node run.mjs groups
```

Results (2026-11-05T20:37:49+00:00):

- `gofmt`, `go vet` and `go test` pass in the whole of `packages/cms`; `pnpm build` passes, and `svelte-check` finds
  nothing in the new island.
- `node run.mjs groups` passes all 45 checks. The eleven new ones sign Admin-1, the owner, in and find:
  - Edit opening Holo's menu with Settings;
  - the dialog with the name, the text and its counter from 200, and the four types with Holo's texts;
  - the counter following the text, a change of type asking first in Holo's words, the result's Done reloading the
    page with the text saved and the Exclusive icon;
  - a taken name refused; Unlimited warning that it cannot be undone and then locking the types;
  - Delete group warning as Holo did, the group gone, and OK leading to the Me page.
  The screenshots `group-settings` and `group-deleted` were read by eye.
- The CMS tests save the settings, trimmed, keeping the group's own name in another case and emptying the text;
  refuse each of Holo's cases in its order with the group untouched; keep Unlimited; remove the waiting requests only
  when the type leaves Exclusive; refuse an admin, the owner's other habbo and a guest; and delete a group, giving its
  stickers back to the two users whose habbos placed them and its note back to its writer.
- Breaking these on purpose fails a test: the requests kept, the group's own name taken as another's, any habbo
  allowed, the items not returned, the Unlimited lock dropped, the text's limit raised, and the text not trimmed.

# Notes

- `groups/group-tools` stands on every group page and shows itself only to the owner's active habbo. A first version
  stood inside `[[ if ]]`: being the page's first island, it carried Astro's script for every island, and for anyone
  but the owner the view tools of [p5-06](/tasks/p5-06-join-leave-favourite.md) never woke. `islands_test.go` now
  checks every built page with several islands, and failed on that version; the gotcha is in the
  `templating-astro-pages` skill.
- The settings reach the island through a hidden element's `data-` attributes, since a description may hold quotes.
- The Edit menu holds Settings alone for now: Modify page, Badge and Members join it with their tasks. Holo's
  `group_tool_icons.png` was never shipped, so the menu shows its words without icons, as Holo's does.
- Holo's forum and room settings panes were hidden and never filled; they are not ported.
- The result dialog's Done reloads the page after every answer, as Holo's link did.
- The `Button` primitive drops its own classes when given a `class`, so the red button stands in a spaced `span`.

