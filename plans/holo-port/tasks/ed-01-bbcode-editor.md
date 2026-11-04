---
type: Task
title: Build the BBCode editor
description: A WYSIWYG BBCode editor of our own in packages/components shows the renderer's tags as they will look, edits the raw codes on demand, keeps on paste what BBCode can say, and posts BBCode through a named field.
status: done
phase: ed
depends_on: []
packages: [packages/components]
holo: []
timestamp: 2026-11-04T21:04:37+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-04T20:35:37+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-04T21:04:37+00:00"}
---

# Goal

One editor for every field that takes BBCode ([0092](/decisions/0092-bbcode-editor.md)).

# Steps

- [x] `bbcode-editor.svelte` in `packages/components`, exported, with a story and tests: a toolbar of Bold, Italic,
  Underline, Strike, Quote, Code, Link, a colour list, Small and Large, and Smilies when the field gives them, over a
  contenteditable area; and a `BBCode` button that swaps in a textarea with the raw codes.
- [x] A reader and a writer in TypeScript between BBCode and the editor's HTML for the renderer's tags: `[b]`, `[i]`,
  `[u]`, `[s]`, `[quote]`, `[code]`, `[url=]` and `[link=]`, `[color=]` with the 8 names, `[size=small]`,
  `[size=large]`, line breaks and smilies. They are shown with the renderer's classes; codes the renderer does not know
  stay text.
- [x] Pasting keeps bold, italic, underline, strike, links, quotes and line breaks, and drops other formatting to its
  text.
- [x] Links take only http and https addresses, as the renderer does.
- [x] A form gets the BBCode through a field named by the page, so it posts as before. A variant gives the site's or
  housekeeping's look.
- [x] Tests for the reader and the writer (round trips, and the renderer's own cases), component tests and the story.

# Verification

```sh
pnpm --filter @project-reborn/components test
pnpm --filter @project-reborn/components check
pnpm --filter @project-reborn/components build-storybook
```

Results (2026-11-04T21:04:37+00:00):

- `pnpm --filter @project-reborn/components test`: 156 tests pass, 31 of them new.
  - The reader shows the 139 cases of the Go renderer's own tests as the CMS renders them, once Chromium has nested
    its HTML, crossed tags included.
  - The writer gives well-formed BBCode back as it was given, and writes a tidier form of the rest that looks the
    same.
  - 3,000 generated texts look the same, character by character, after a save, and a second save changes nothing.
  - Every point of the text is found again after the area is drawn again.
  - The editor:
    - shows the field's BBCode and hides the field, and gives it back when it goes;
    - writes typing, with Enter as a line break;
    - applies bold (and removes it), italic, underline, strike, colours, sizes, quotes and code boxes, and puts the
      caret in an empty quote;
    - links only http and https addresses, and removes a link;
    - adds smilies only where they show;
    - edits the raw codes in the BBCode view;
    - keeps on paste what BBCode can say, with no empty line at a line's edge;
    - undoes and redoes typing and the toolbar's changes;
    - follows a value given from outside, and has housekeeping's look in housekeeping.
- `pnpm --filter @project-reborn/components check`: 0 errors and 0 warnings.
- `pnpm --filter @project-reborn/components build-storybook` passes. The screenshots of both stories show the site's
  and housekeeping's looks and the BBCode view.
- The CMS and housekeeping frontends build with the new export.
- Breaking these on purpose fails a test, each from a passing run:
  - writing a code inside the same code;
  - a size or a colour read as a `<span>`;
  - Enter left to the browser;
  - a browser's `<b>` left in the area;
  - a pasted block's line kept at a line's edge;
  - a selection that starts before its boundary;
  - typing that is not undoable.

# Notes

- Built with the skills `adding-svelte-interactivity` and `building-astro-components`.
- `packages/components/src/bbcode.ts` reads BBCode with the Go renderer's passes and leaves the nesting to the browser,
  whose tree construction the renderer emulates; colours and sizes are `<font>` elements there, as in Holo's HTML,
  because the parser nests a `<span>` differently. The writer never writes a code inside one that ends the same way,
  which Holo's passes could not read back.
- Bold, italic, underline, strike and links use the browser's editing commands; quotes, code, colours, sizes, smilies
  and pastes change the DOM directly. After each, the area is drawn again from the BBCode, so the editor keeps its own
  undo.
- A code typed as text in the editor works as a code once saved, as in the BBCode view.
- New texts: the toolbar's `Bold`, `Italic`, `Underline`, `Strike`, `Quote`, `Code`, `Link`, `Colours`, `Small`,
  `Large`, `Smiley :)` and `BBCode`; and the link row's `Address`, `Add link`, `Remove link`, `Cancel` and "The
  address must start with http:// or https://.".
