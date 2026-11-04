---
type: Task
title: Write news stories with the editor
description: The Story field of housekeeping's news forms uses the BBCode editor with housekeeping's look and no smilies, and the form posts the story as before.
status: todo
phase: ed
depends_on: [ed-01]
packages: [packages/housekeeping, tests/e2e]
holo: []
timestamp: 2026-11-04T20:35:37+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-04T20:35:37+00:00"}
---

# Goal

Staff write news stories in the editor ([0092](/decisions/0092-bbcode-editor.md)).

# Steps

- [ ] The Story field of Compose News Item and of an article's edit form shows the editor with housekeeping's look and
  no smilies, as the site renders news without them. The form posts `story` as before.
- [ ] Without JavaScript the field stays the textarea.
- [ ] The `housekeeping-news` browser suite writes a story with the toolbar, and checks the saved BBCode and the
  article on the site.

# Verification

```sh
# gofmt, go vet and go test -race in packages/housekeeping
cd packages/housekeeping && pnpm build
cd tests/e2e && node run.mjs housekeeping-news news
```
