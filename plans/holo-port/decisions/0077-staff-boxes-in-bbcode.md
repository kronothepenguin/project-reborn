---
type: Decision
title: The staff page boxes are BBCode with a colour each
description: The two text boxes of the staff page are BBCode, edited in a multi-line field, each with one of Holo's four colours chosen from a list.
status: accepted
timestamp: 2026-11-04T01:26:49+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-04T01:26:49+00:00"}
tags: [cms, housekeeping, settings, staff]
---

# Decision

- The bodies of the two staff page boxes are BBCode, rendered by `packages/cms/internal/bbcode` like news.
- Housekeeping's settings editor gains a multi-line field and a field with a fixed list of choices.
- Each box takes one of Holo's colours: Red, Blue, White (no Header) and Green.

# Context

Holo stored raw HTML for the boxes and edited them in a multi-line field, with a colour list for each. The user chose
"BBCode" over plain text and over today's single-line fields.

# Consequences

- The settings editor's new fields serve any long text or fixed choice a later phase declares.
