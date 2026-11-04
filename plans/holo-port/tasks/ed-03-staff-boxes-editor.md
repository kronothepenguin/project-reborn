---
type: Task
title: Write the staff boxes with the editor
description: A settings field can be marked as BBCode, the Staff Module's two boxes are, and such fields use the BBCode editor with housekeeping's look and no smilies.
status: todo
phase: ed
depends_on: [ed-01]
packages: [packages/housekeeping, tests/e2e]
holo: []
timestamp: 2026-11-04T20:35:37+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-04T20:35:37+00:00"}
---

# Goal

Staff write the staff page's boxes, and later the credits page's, in the editor
([0092](/decisions/0092-bbcode-editor.md)).

# Steps

- [ ] A field of `internal/router/sections.go` can be marked as BBCode, and the Staff Module's two boxes are. P6's
  credits boxes take the mark when they are declared.
- [ ] Marked fields show the editor with housekeeping's look and no smilies, as the staff page renders them. The form
  posts as before.
- [ ] Go tests for the mark, and a browser suite writes a box with the editor and checks the staff page.

# Verification

```sh
# gofmt, go vet and go test -race in packages/housekeeping
cd packages/housekeeping && pnpm build
cd tests/e2e && node run.mjs housekeeping-settings staff
```
