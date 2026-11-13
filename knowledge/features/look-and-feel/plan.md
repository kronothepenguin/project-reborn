---
type: Plan
title: "Look and feel: Holo's look at today's sizes: how"
description: The site's sizes move into theme tokens, then to a 16px design, after the differences from HoloCMS.
---

# Architecture

Built:

| Project | Part |
| --- | --- |
| `packages/cms` | `layouts/signed-out.astro` and `layouts/community.astro`, with the `header/*` components and the footers |
| `packages/housekeeping` | `layouts/housekeeping.astro`: the grey bar, the tabs, the left column of `box` components and the content; `Box color="gold"` for data lists |
| `packages/components` | The primitives both apps share; `Table` and `Table variant="form"` give housekeeping's lists and forms |
| `packages/store` | `CountAvatars`, the header's registered count |

Planned:

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

- [Housekeeping gets its own simple design system](/decisions/holo-port/0041-housekeeping-design-system.md) —
  Housekeeping follows Habbo's original housekeeping, simple tables with white and blue sections.
- [The footer names Project Reborn](/decisions/holo-port/0048-footer-names-reborn.md) — The footer keeps `Powered by
  Project Reborn ©` in place of Holo's line.
- [Housekeeping components have one look each](/decisions/holo-port/0060-housekeeping-components.md) — Blue
  navigation, gold data lists, blue forms and a grey top bar, the same on every page.

The user's decisions are written here when the feature is planned.

# Notes

- Holo's `registered users` counted its `users` table, which held one row per habbo, so the header counts habbos.
- Astro drops whitespace that holds a line break next to an element, so such a sentence stays on one line.
- `>>` is wider than the `»` it replaced, and its box is half the button, so it needs `whitespace-nowrap`.
