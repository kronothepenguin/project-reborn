---
type: Task
title: Write the staff boxes with the editor
description: A settings field can be marked as BBCode, the Staff Module's two boxes are, and such fields use the BBCode editor with housekeeping's look and no smilies.
status: done
phase: ed
depends_on: [ed-01]
packages: [packages/housekeeping, tests/e2e]
holo: []
timestamp: 2026-11-04T21:13:36+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-04T20:35:37+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-04T21:13:36+00:00"}
---

# Goal

Staff write the staff page's boxes, and later the credits page's, in the editor
([0092](/decisions/0092-bbcode-editor.md)).

# Steps

- [x] A field of `internal/router/sections.go` can be marked as BBCode, and the Staff Module's two boxes are. P6's
  credits boxes take the mark when they are declared.
- [x] Marked fields show the editor with housekeeping's look and no smilies, as the staff page renders them. The form
  posts as before.
- [x] Go tests for the mark, and a browser suite writes a box with the editor and checks the staff page.

# Verification

```sh
# gofmt, go vet and go test -race in packages/housekeeping
cd packages/housekeeping && pnpm build
cd tests/e2e && node run.mjs housekeeping-settings staff
```

Results (2026-11-04T21:13:36+00:00):

- `gofmt`, `go vet` and `go test` pass in `packages/housekeeping`. `TestTheStaffBoxesTakeTheBBCodeEditor` checks that
  the two boxes, and no other field of the Staff Module, carry the mark; dropping the first box's mark fails it.
- The editor takes its name and its height from the field it stands in for when it is given neither, so each box's
  island takes only its key: `field="[[ .Key ]]"`. The components' tests gain that case; all 157 pass.
- `pnpm build` passes; `dist/settings.html` holds the island once, behind `[[ if .BBCode ]]`.
- From a fresh build, `housekeeping-settings` and `staff` pass all 41 checks. `housekeeping-settings` gains:
  - the two staff boxes are editors named by their labels, with no smilies, and the other fields stay plain;
  - a box written with the toolbar is saved as `[b]Need help?[/b]\nAsk us.` and shown bold again;
  - the staff page shows it as written;
  - without JavaScript the boxes are plain fields.
  The screenshot `settings-staff` shows the form.
- Without the island, `housekeeping-settings` fails, from a passing run.
