---
type: Task
title: Build the BBCode editor
description: A WYSIWYG BBCode editor of our own in packages/components shows the renderer's tags as they will look, edits the raw codes on demand, keeps on paste what BBCode can say, and posts BBCode through a named field.
status: todo
phase: ed
depends_on: []
packages: [packages/components]
holo: []
timestamp: 2026-11-04T20:35:37+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-04T20:35:37+00:00"}
---

# Goal

One editor for every field that takes BBCode ([0092](/decisions/0092-bbcode-editor.md)).

# Steps

- [ ] `bbcode-editor.svelte` in `packages/components`, exported, with a story and tests: a toolbar of Bold, Italic,
  Underline, Strike, Quote, Code, Link, a colour list, Small and Large, and Smilies when the field gives them, over a
  contenteditable area; and a `BBCode` button that swaps in a textarea with the raw codes.
- [ ] A reader and a writer in TypeScript between BBCode and the editor's HTML for the renderer's tags: `[b]`, `[i]`,
  `[u]`, `[s]`, `[quote]`, `[code]`, `[url=]` and `[link=]`, `[color=]` with the 8 names, `[size=small]`,
  `[size=large]`, line breaks and smilies. They are shown with the renderer's classes; codes the renderer does not know
  stay text.
- [ ] Pasting keeps bold, italic, underline, strike, links, quotes and line breaks, and drops other formatting to its
  text.
- [ ] Links take only http and https addresses, as the renderer does.
- [ ] A form gets the BBCode through a field named by the page, so it posts as before. A variant gives the site's or
  housekeeping's look.
- [ ] Tests for the reader and the writer (round trips, and the renderer's own cases), component tests and the story.

# Verification

```sh
pnpm --filter @project-reborn/components test
pnpm --filter @project-reborn/components check
pnpm --filter @project-reborn/components build-storybook
```

# Notes

- Built with the skills `adding-svelte-interactivity` and `building-astro-components`.
