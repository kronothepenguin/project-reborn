---
type: Phase
title: ED BBCode editor
description: A WYSIWYG BBCode editor of our own, shared by housekeeping's news and staff boxes, the home notes and the coming forum.
status: active
timestamp: 2026-11-04T20:35:37+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-04T20:35:37+00:00"}
tags: [ed, bbcode, components, cms, housekeeping]
---

# Goal

Wherever BBCode is written, staff and habbos see the text as it will look while they type, and can still edit the raw
codes ([0092](/decisions/0092-bbcode-editor.md)).

# Scope

| Where | Field | Today |
| --- | --- | --- |
| `packages/components` | `BBCodeEditor`, shared by every field below | — |
| Housekeeping, news | The Story of Compose News Item and of an article's edit form | A textarea, "BBCode is allowed here." |
| Housekeeping, settings | The Staff Module's two boxes, and P6's credits boxes once they are declared | A textarea |
| CMS, home notes | The note editor of the home store | Buttons that insert codes, and a Preview |

- The editor reads and writes the tags of `packages/cms/internal/bbcode` and shows them with the renderer's classes.
- Smilies show only where the field's page renders them: the notes, and later the forum. News and the staff boxes
  render without them.
- [P5](/phases/p5-groups-forum.md)'s forum uses the editor from its first post.

# Exit criteria

- In each field, bold, italic, underline, strike, quote, code, links, colours and sizes (and smilies in notes) can be
  applied, are shown as they will look, and are saved as BBCode that renders on the site as it looked in the editor.
- The `BBCode` button edits the raw codes, and pasting keeps what BBCode can say.
- Without JavaScript every field still works as a plain textarea.

# Tasks

- [ed-01 Build the BBCode editor](/tasks/ed-01-bbcode-editor.md) — done
- [ed-02 Write news stories with the editor](/tasks/ed-02-news-story-editor.md) — todo
- [ed-03 Write the staff boxes with the editor](/tasks/ed-03-staff-boxes-editor.md) — todo
- [ed-04 Write home notes with the editor](/tasks/ed-04-note-editor.md) — todo
- [ed-05 Verify ED](/tasks/ed-05-exit-check.md) — todo
