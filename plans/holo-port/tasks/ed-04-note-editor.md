---
type: Task
title: Write home notes with the editor
description: The home store's note editor uses the BBCode editor with the site's look and smilies when they are on, in place of its buttons, and keeps its skins, counter and Preview.
status: todo
phase: ed
depends_on: [ed-01]
packages: [packages/cms, tests/e2e]
holo: []
timestamp: 2026-11-04T20:35:37+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-04T20:35:37+00:00"}
---

# Goal

Habbos write notes in the editor ([0092](/decisions/0092-bbcode-editor.md)).

# Steps

- [ ] The note editor of the home store uses the editor with the site's look, and with smilies while
  `features.smilies` is on, in place of its buttons.
- [ ] Its six skins, its counter of characters (of the BBCode) and its Preview stay, and placing a note works as
  before.
- [ ] The `homes` browser suite writes a note with the toolbar and checks the placed note.

# Verification

```sh
cd packages/cms && pnpm build
cd tests/e2e && node run.mjs homes
```
