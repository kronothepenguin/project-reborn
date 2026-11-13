---
type: Plan
title: "Look and feel: Holo's look at today's sizes: how"
description: The site's sizes move into theme tokens, then to a 16px design, after the differences from HoloCMS.
---

# Architecture

| Project | Part |
| --- | --- |
| `packages/cms` | The differences from HoloCMS found by running both; the layouts, header and pages moved to theme tokens, then to the 16px design |
| `packages/components` | Its seven fixed sizes moved to tokens; bitmaps at 1x or exactly 2x |
| `packages/housekeeping`, `packages/installer` | Only if the user wants them redesigned too |
| `tests/e2e` | Screenshots of every page before and after, if the user allows a new kind of test |

[The comparison](/features/look-and-feel/research-holo-look.md) ran both systems and measured them. The navbar looks
plain because the public site never sets Holo's font, Verdana, so the browser falls back to a lighter one; the weights
already match. After the font come the line height, the tabs' artwork, the sub-navigation, the inner tabs, the boxes'
frame and padding, the title bars' size and colours, the header and the footer.

[The redesign study](/features/look-and-feel/research-redesign.md) recommends moving every size into theme tokens first,
with nothing changing on screen, then setting the tokens to a 16px design about 4/3 wider (a 1240px page), with bitmaps
never scaled by a fraction. An exact 16/11 scale gives a page of about 1382px, which does not fit a 1366 screen.

The known issue of [later](/features/look-and-feel/later.md), group badge tint 15 is not brown, belongs here.

# Decisions

The user's decisions are written here when the feature is planned.
