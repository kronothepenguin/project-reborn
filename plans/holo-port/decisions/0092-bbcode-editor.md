---
type: Decision
title: A WYSIWYG BBCode editor of our own wherever BBCode is written
description: Every field that takes BBCode gets one shared editor, written on contenteditable with no library, that shows the text as it will look and the raw codes on demand, built in its own phase before P5.
status: accepted
timestamp: 2026-11-04T20:35:37+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-04T20:35:37+00:00"}
tags: [bbcode, components, housekeeping, cms]
---

# Decision

- Every field that takes BBCode gets one shared editor:
  - housekeeping's news story;
  - the staff page boxes, and later the credits page boxes;
  - the home notes;
  - the forum's new threads, replies and edits.
- It shows the text as it will look while it is typed, and a `BBCode` button shows the raw codes for editing.
- Its toolbar offers what the renderer knows: bold, italic, underline, strike, quote, code, link, the 8 colours, small
  and large size, and smilies where the field shows them.
- Pasted text keeps what BBCode can say (bold, italic, underline, strike, links, quotes and line breaks). Other
  formatting is dropped and its text kept.
- It is written from scratch on the browser's contenteditable, with no library, as one component in
  `packages/components`, with the site's look in the CMS and housekeeping's in housekeeping
  ([0060](/decisions/0060-housekeeping-components.md)).
- It is built in its own phase, [ED](/phases/ed-bbcode-editor.md), before P5.

# Context

The user: "i want to add an extra feature for the housekeeping and everywhere it applies. whenever a textarea accepts
bbcode, i want to add a bbcode rte." Holo has no rich text editor; its forum and notes had buttons that insert codes.
The user then chose a WYSIWYG of their own over TipTap, SCEditor or buttons with a preview, every BBCode field, its own
phase before P5, and keeping on paste what BBCode can say.

# Consequences

- The home note editor's buttons give way to the editor; its skins, its counter and its Preview stay.
- Text saved through the editor looks the same on the site, but its codes may be written differently: crossed tags
  untangled, and `[link=]` written as `[url=]`.
- Without JavaScript, a field stays the plain textarea it is today.
