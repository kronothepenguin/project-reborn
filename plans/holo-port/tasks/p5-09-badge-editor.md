---
type: Task
title: Edit a group's badge
description: The Badge entry of the Edit menu opens the HTML5 port of Holo's badge editor with the live palette, and its Save stores a checked code that the renderer draws.
status: done
phase: p5
depends_on: [p5-03, p5-07]
packages: [packages/cms, tests/e2e]
holo: [source/holocms/show_badge_editor.php, source/holocms/save_group_badge.php]
timestamp: 2026-11-05T20:54:05+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T19:06:47+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-05T20:54:05+00:00"}
---

# Goal

Admins design their group's badge, as with Holo's Flash editor ([0042](/decisions/0042-two-badge-palettes.md)).

# Steps

- [x] The editor is built from `vendor/HabboWidgets/badge-editor` as its README says, into
  `packages/cms/public/habbo-widgets/badge-editor/`, with the live palette in its colour data, which a test keeps
  equal to the renderer's.
- [x] ⚡`groups/badge-editor`: a dialog with the editor on the group's code; Save posts it and Cancel closes.
- [x] `POST /groups/{id}/badge` for the group's admins refuses a code the check refuses, and otherwise stores it.
- [x] Go tests, and the `groups` browser suite saves a badge and finds it drawn.

# Verification

```sh
# gofmt, go vet and go test -race in packages/cms
cd tests/e2e && node run.mjs groups
```

Results (2026-11-05T20:54:05+00:00):

- The editor was built from the submodule at its pinned commit 1a7a024, copied to the scratchpad, with `npm ci` and
  `npm run build`; `badge-editor.js`, `data/` and `sprites/` are in `packages/cms/public/habbo-widgets/badge-editor/`
  (113 files, 492 KB).
- `gofmt`, `go vet` and `go test` pass in the whole of `packages/cms`; `pnpm build` passes, and `svelte-check` finds
  nothing in the new component.
- `node run.mjs groups` passes all 56 checks. The two new ones open Badge from Admin-1's Edit menu, find the editor
  reading the CMS's colour file, click the base's second colour and Save on its canvas, and find the code stored as
  `b0702Xs01124` and drawn by the CMS at 39 pixels. The screenshot `group-badge-editor` was read by eye.
- The CMS tests find the editor's colour file, as the CMS serves it, equal to the renderer's live palette, store a
  code from the owner, refuse five codes the editor would not write, and refuse a member and a guest.
- Breaking these on purpose fails a test: the code's check dropped, any member allowed, and the renderer switched to
  Holo's palette while the editor keeps Tailwind's.

# Notes

- Holo's Badge entry opens the badge editor for every admin, between Settings and Members.
- The editor's script runs once a page, when the dialog first opens, and draws into `#editor-container`, which stays
  in the page. A save reloads the page, as Holo's redirect to the group did.
- The editor's own preview multiplies its grey sprites by a tint, which matches the renderer's grey level times the
  tint on grey art.
- `vendor/HabboWidgets` is a submodule that a new worktree does not check out; the build used the main checkout's copy
  without writing to it.

