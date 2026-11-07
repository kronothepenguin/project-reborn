---
type: Task
title: Open Save changes five seconds after the editor starts, as Holo's Flash did
description: Holo's Flash editor opened the looks form's Save changes five seconds after it started with a look the club allows, where the HTML5 editor keeps it closed until it is touched, on the page's load and after a green arrow of the wardrobe.
status: blocked
phase: p6
depends_on: [p6-06]
packages: [packages/cms, tests/e2e]
holo: [source/holocms/account.php, source/holocms/web-gallery/static/js/settings.js]
timestamp: 2026-11-07T00:35:59+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-07T00:35:59+00:00"}
---

# Goal

A habbo saves a look it did not change on `/account/looks`, as on Holo's, so that the wardrobe's `Press green arrow
to select an outfit and save changes to take it into use.` holds without touching the editor
([0034](/decisions/0034-behaviour-matches-holo.md)).

# Steps

- [ ] The user chooses where the change goes (see Notes).
- [ ] Save changes opens five seconds after the editor has drawn itself with a look the club allows, and stays closed
  for one with club items outside the club; a change in those five seconds counts at their end, as in the Flash.
- [ ] `/register` keeps ignoring the editor's answer, as [p2-04](/tasks/p2-04-account-looks.md) requires.
- [ ] The `looks` suite finds Save changes opening by itself after the page loads and after a green arrow, in place of
  `save stays disabled until the editor is touched`.

# Verification

```sh
# gofmt, go vet and go test -race in packages/cms
cd tests/e2e && node run.mjs looks register habbos
```

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
