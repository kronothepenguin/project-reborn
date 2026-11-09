---
type: Task
title: Open Save changes five seconds after the editor starts, as Holo's Flash did
description: Holo's Flash editor opened the looks form's Save changes five seconds after it started with a look the club allows, where the HTML5 editor keeps it closed until it is touched, on the page's load and after a green arrow of the wardrobe.
status: done
phase: p6
depends_on: [p6-06]
packages: [packages/cms, tests/e2e]
holo: [source/holocms/account.php, source/holocms/web-gallery/static/js/settings.js]
timestamp: 2026-11-09T17:22:53+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-07T00:35:59+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-09T17:22:53+00:00"}
---

# Goal

A habbo saves a look it did not change on `/account/looks`, as on Holo's, so that the wardrobe's `Press green arrow
to select an outfit and save changes to take it into use.` holds without touching the editor
([0034](/decisions/0034-behaviour-matches-holo.md)).

# Steps

- [x] The user chooses where the change goes (see Notes): `habbo/avatar-editor`
  ([0107](/decisions/0107-save-opens-after-the-first-look.md)).
- [x] Save changes opens five seconds after the editor has drawn itself with a look the club allows, and stays closed
  for one with club items outside the club; a change in those five seconds counts at their end, as in the Flash.
- [x] `/register` keeps ignoring the editor's answer, as [p2-04](/tasks/p2-04-account-looks.md) requires.
- [x] The `looks` suite finds Save changes opening by itself after the page loads and after a green arrow, in place of
  `save stays disabled until the editor is touched`.

# Verification

```sh
# gofmt, go vet and go test -race in packages/cms
cd tests/e2e && node run.mjs looks register habbos
```

Results (2026-11-09T17:22:53+00:00):

- In `packages/cms`, `gofmt` lists nothing, and `go vet` and `go test -race` pass.
- `node run.mjs looks register habbos` passes all 127 checks: `looks` 39, `register` 66 and `habbos` 22. Of the 39, 8
  are new and one more now finds the green arrow closing Save changes; `save stays disabled until the editor is
  touched` is gone. Two more runs of `looks` pass all 39, since its checks time Save changes.
- Breaking it on purpose fails it: with the five seconds' end taking the editor's last answer whether or not the look
  changed, as the code stood when this task was resumed, `looks` fails `save opens by itself five seconds after the
  editor draws a look the club allows`, its two checks in the wardrobe, and the save that waits for it.

# Notes

- Found by [p6-06](/tasks/p6-06-club-wardrobe.md). The Flash's `AvatarEditorUi.createUi`, decompiled in
  `vendor/HabboWidgets/habbo-registration/version-2.0/decompiled/scripts/__Packages/com/sulake/habbo/avatareditor/AvatarEditorUi.as`,
  tells the page `true`, then `false`, once it has drawn itself, sets `mEditorOkToProceed` back to `true` and blocks
  for five seconds, at whose end it tells the page `mEditorOkToProceed`: `true`, unless the look changed meanwhile.
- The HTML5 editor of `vendor/HabboWidgets` starts its five seconds when it is built, and leaves `editorOkToProceed`
  at the `false` it sent last, so the page hears `false` at their end. p2-04 took that for Holo's behaviour.
- **Blocked**: the user chooses, in the phase's open questions: the HTML5 editor of `vendor/HabboWidgets`, which
  agents may not change, does as the Flash did, and `packages/cms/public/habbo-editor.iife.js` is built again from it;
  or `packages/cms/src/components/habbo/avatar-editor.svelte` opens Save changes five seconds after the editor's first
  look, unless the club notice showed or the look changed, setting aside the editor's own answer at the end of its
  five seconds; or nothing changes, and a habbo touches the editor before saving a look it did not change.
- Unblocked on 2026-11-07: the user chose `habbo/avatar-editor`,
  [0107](/decisions/0107-save-opens-after-the-first-look.md).
- `saveChanges` in `habbo/avatar-editor` keeps the Flash's five seconds. It sets aside what the editor answers before
  its first look, where the HTML5 editor's own five seconds, counted from its start, can end, and so can those of an
  editor a green arrow replaced. Right after its first look the editor hides the club notice, for a look the club
  allows, and the five seconds start; or it shows the notice, and every answer counts at once, as the Flash held
  nothing for such a look. Through the five seconds the answers wait; at their end Save changes opens, or, if the look
  changed meanwhile, takes the editor's last answer, `false` for a look with club items outside the club.
- A green arrow closes Save changes as it starts the editor again, as the new Flash did on its start, and Save changes
  opens five seconds after the editor has drawn the outfit, after the HTML5 editor's loading screen; the wardrobe's
  row of [Holo's differences](/reference/holo-differences.md) says so.
- The HTML5 editor still holds its own answers until five seconds after it was built, up to two seconds after its first
  look: for a look with club items outside the club, a change in those two seconds is answered when they end, where
  the Flash answered at once. The looks row of [Holo's differences](/reference/holo-differences.md) says so.
- The registration form and the Habbos page give the wrapper no save button, so it keeps no five seconds there, and
  `/register` still takes no answer from the editor.
- The suite's direct calls of `setAllowedToProceed`, `showHabboClubNotice` and `showOldFigureNotice` stay as p2-04's
  checks of what the page does with each answer; they run on a look with club items outside the club, whose answers
  count at once. Every save of the suite now waits for Save changes to open by itself.
