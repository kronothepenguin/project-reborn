---
type: Task
title: Write news stories with the editor
description: The Story field of housekeeping's news forms uses the BBCode editor with housekeeping's look and no smilies, and the form posts the story as before.
status: done
phase: ed
depends_on: [ed-01]
packages: [packages/housekeeping, tests/e2e]
holo: []
timestamp: 2026-11-04T21:08:47+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-04T20:35:37+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-04T21:08:47+00:00"}
---

# Goal

Staff write news stories in the editor ([0092](/decisions/0092-bbcode-editor.md)).

# Steps

- [x] The Story field of Compose News Item and of an article's edit form shows the editor with housekeeping's look and
  no smilies, as the site renders news without them. The form posts `story` as before.
- [x] Without JavaScript the field stays the textarea.
- [x] The `housekeeping-news` browser suite writes a story with the toolbar, and checks the saved BBCode and the
  article on the site.

# Verification

```sh
# gofmt, go vet and go test -race in packages/housekeeping
cd packages/housekeeping && pnpm build
cd tests/e2e && node run.mjs housekeeping-news news
```

Results (2026-11-04T21:08:47+00:00):

- `gofmt`, `go vet` and `go test` pass in `packages/housekeeping`; its Go code did not change.
- `pnpm build` passes. `dist/news/new.html` and `dist/news/id.html` each hold two islands, the image editor and the
  BBCode editor by its export `BBCodeEditor`, beside the `news-story` field.
- From a fresh build, `housekeeping-news` and `news` pass all 75 checks. `housekeeping-news` gains five:
  - the story is written in the editor, with housekeeping's look and no smilies, in place of the field;
  - the toolbar makes a selection bold where it is written, and the field holds the BBCode;
  - the edit form shows the story in the editor as the site will;
  - an edit that leaves the story keeps its BBCode as it was;
  - without JavaScript the story is the plain field.
  The site still shows the story with its bold. The screenshot `news-story-editor` shows the form.
- Without the island, `housekeeping-news` fails, from a passing run.
- `node run.mjs` replaces `pnpm test` in the verification: with several suites, `pnpm test` in a background shell ran
  coreutils' `test`.
