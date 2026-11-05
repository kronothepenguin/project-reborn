---
type: Task
title: Edit a group's badge
description: The Badge entry of the Edit menu opens the HTML5 port of Holo's badge editor with the live palette, and its Save stores a checked code that the renderer draws.
status: todo
phase: p5
depends_on: [p5-03, p5-07]
packages: [packages/cms, tests/e2e]
holo: [source/holo/show_badge_editor.php, source/holo/save_group_badge.php]
timestamp: 2026-11-05T19:06:47+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T19:06:47+00:00"}
---

# Goal

Admins design their group's badge, as with Holo's Flash editor ([0042](/decisions/0042-two-badge-palettes.md)).

# Steps

- [ ] The editor is built from `vendor/HabboWidgets/badge-editor` as its README says, into
  `packages/cms/public/habbo-widgets/badge-editor/`, with the live palette in its colour data, which a test keeps
  equal to the renderer's.
- [ ] ⚡`groups/badge-editor`: a dialog with the editor on the group's code; Save posts it and Cancel closes.
- [ ] `POST /groups/{id}/badge` for the group's admins refuses a code the check refuses, and otherwise stores it.
- [ ] Go tests, and the `groups` browser suite saves a badge and finds it drawn.

# Verification

```sh
# gofmt, go vet and go test -race in packages/cms
cd tests/e2e && node run.mjs groups
```
