---
type: Slice
title: Look and feel: Holo's look at today's sizes
description: The site matches HoloCMS where it drifted, and is redesigned at a 16px base with a wider layout that keeps Holo's look and feel.
status: planned
projects: [cms, components, housekeeping, installer]
depends_on: []
from: ["plans/later.md"]
timestamp: 2026-11-13T00:42:05+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-13T00:42:05+00:00"}
tags: [look-and-feel, cms, components]
---

# Goal

The site looks like HoloCMS, at sizes made for today's screens.

The user: "the community layout looks like holo cms, but not as holo cms. the link-buttons in the navbar are plain and
not bold, but holo used to be bold."

The user: "i know holo used to have font-size of 11px, but that's because screens back them used to be small compared to
today's screens. 1360 vs 1960. i want to redesign but keep the look & feel of holo cms. my idea is use today's sizes
like font-size: 16px. and make the layout's a little bigger to match this new font-size."

# Scope

| Project | Part |
| --- | --- |
| `packages/cms` | The differences from HoloCMS found by running both; the layouts, header and pages moved to theme tokens, then to the 16px design |
| `packages/components` | Its seven fixed sizes moved to tokens; bitmaps at 1x or exactly 2x |
| `packages/housekeeping`, `packages/installer` | Only if the user wants them redesigned too |
| `tests/e2e` | Screenshots of every page before and after, if the user allows a new kind of test |

[The comparison](/reference/research-holo-look.md) ran both systems and measured them. The navbar looks plain because
the public site never sets Holo's font, Verdana, so the browser falls back to a lighter one; the weights already match.
After the font come the line height, the tabs' artwork, the sub-navigation, the inner tabs, the boxes' frame and
padding, the title bars' size and colours, the header and the footer.

[The redesign study](/reference/research-redesign.md) recommends moving every size into theme tokens first, with nothing
changing on screen, then setting the tokens to a 16px design about 4/3 wider (a 1240px page), with bitmaps never scaled
by a fraction. An exact 16/11 scale gives a page of about 1382px, which does not fit a 1366 screen.

The known issue of `plans/later.md`, group badge tint 15 is not brown, belongs here.

# Exit criteria

Written with the slice's tasks, once its open questions are answered.

# Tasks

Written when the slice starts.

# Open questions

- The ten questions of [the redesign
  study](/reference/research-redesign.md#questions-for-the-owner-recommended-answer-first): what is redesigned, whether
  it replaces "exactly as Holo" for sizes only (`plans/holo-port/decisions/0034-behaviour-matches-holo.md`), the font
  and its size, fixed or fluid, the factor, avatars and badges, home pages, the Help Tool, screenshot baselines, the
  order.
- Whether the differences from HoloCMS are fixed on today's 11px layout first, or with the redesign.
- Of [the comparison](/reference/research-holo-look.md): whether Holo's tab image `tabs.png` is copied or its look
  redrawn in CSS, and where the font is set, on the community layout alone or for the whole site.
