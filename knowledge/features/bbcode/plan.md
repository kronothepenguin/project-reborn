---
type: Plan
title: "BBCode: how"
description: The CMS's formatter renders BBCode on the server, the components package holds the editor and its reader and writer, and the CMS and housekeeping put the editor on their BBCode fields.
---

# Architecture

| Project | Part |
| --- | --- |
| `packages/cms` | `internal/bbcode`: `Format` renders BBCode as Holo's `bbcode_format(nl2br(text))`, smilies optional, and `Lines` renders a summary escaped with its line breaks. The pages of news, the forum, homes, staff and credits call it. `POST /bbcode/preview` answers a note's preview. The forum's forms and the note editor use the editor |
| `packages/components` | `bbcode-editor.svelte`, the shared editor, and `bbcode.ts`, which reads BBCode as the Go formatter does and writes an editor's DOM back to BBCode |
| `packages/housekeeping` | The news story and the long settings fields marked BBCode use the editor |

# Decisions

- BBCode is a feature of its own, because news, the forum, homes and the settings all use it. The user chose "A feature
  each" on 2026-11-15.
- [News bodies in BBCode](/decisions/holo-port/0020-news-in-bbcode.md) — One formatter, `packages/cms/internal/bbcode`,
  serves forum posts, notes and news, with colours as Tailwind classes.
- [The staff page boxes are BBCode with a colour each](/decisions/holo-port/0077-staff-boxes-in-bbcode.md) — The staff
  boxes are BBCode, formatted like news.
- [A WYSIWYG BBCode editor of our own wherever BBCode is written](/decisions/holo-port/0092-bbcode-editor.md) — One
  editor in `packages/components`, on contenteditable with no library, on every BBCode field.
- [The credits page boxes are BBCode with their pictures in the
  page](/decisions/holo-port/0105-credits-boxes-in-bbcode.md) — The credits boxes are BBCode, edited in the editor.
