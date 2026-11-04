---
type: Task
title: Write home notes with the editor
description: The home store's note editor uses the BBCode editor with the site's look and smilies when they are on, in place of its buttons, and keeps its skins, counter and Preview.
status: done
phase: ed
depends_on: [ed-01]
packages: [packages/cms, tests/e2e]
holo: []
timestamp: 2026-11-04T21:19:16+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-04T20:35:37+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-04T21:19:16+00:00"}
---

# Goal

Habbos write notes in the editor ([0092](/decisions/0092-bbcode-editor.md)).

# Steps

- [x] The note editor of the home store uses the editor with the site's look, and with smilies while
  `features.smilies` is on, in place of its buttons.
- [x] Its six skins, its counter of characters (of the BBCode) and its Preview stay, and placing a note works as
  before.
- [x] The `homes` browser suite writes a note with the toolbar and checks the placed note.

# Verification

```sh
cd packages/cms && pnpm build
cd tests/e2e && node run.mjs homes
```

Results (2026-11-04T21:19:16+00:00):

- The edit page gives the islands `features.smilies` beside the note's most characters, and the home editor passes it
  through the store dialog to the note editor. `TestTheEditPageIsTheOwners` checks it on and off; a page that always
  says on fails it.
- The editor gains `maxLength`: a change that makes the BBCode longer is turned away, whether typed, from the toolbar
  or pasted, as the note's textarea turned it away. The components' tests gain that case; all 158 pass, and
  `svelte-check` finds nothing.
- `gofmt`, `go vet` and `go test` pass in `packages/cms`, and `pnpm build` passes.
- From a fresh build, `homes` passes all 31 checks. It gains:
  - the note is written in the editor, with the site's look and the smilies;
  - the counter counts the note's BBCode;
  - the preview shows the bold and the smiley;
  - the placed note keeps `[b]Welcome[/b] to my page:)` and shows its smiley.
  The screenshot `home-note-editor` shows the note editor.
- Without the smilies passed to the editor, `homes` fails, from a passing run.
