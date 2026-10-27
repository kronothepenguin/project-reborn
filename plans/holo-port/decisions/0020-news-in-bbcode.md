---
type: Decision
title: News bodies in BBCode
description: News article bodies are BBCode rendered by the same renderer as forum posts and sticky notes.
status: accepted
timestamp: 2026-10-27T20:48:19+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-27T20:48:19+00:00"}
tags: [cms, news]
---

# Decision

- `news_articles.body` is BBCode.
- One renderer, `packages/cms/internal/bbcode`, serves forum posts, sticky notes and news. Colours become Tailwind
  classes, never inline hex.
- Housekeeping edits raw BBCode and links to the article on the site instead of previewing it.

# Context

Holo stored raw staff HTML and rendered it unescaped.
