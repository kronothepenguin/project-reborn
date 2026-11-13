---
type: Spec
title: "Look and feel: Holo's look at today's sizes"
description: The site matches HoloCMS where it drifted, and is redesigned at a 16px base with a wider layout that keeps Holo's look and feel.
status: planned
projects: [packages/cms, packages/components, packages/housekeeping, packages/installer]
---

# What

The site looks like HoloCMS, at sizes made for today's screens.

The user: "the community layout looks like holo cms, but not as holo cms. the link-buttons in the navbar are plain and
not bold, but holo used to be bold."

The user: "i know holo used to have font-size of 11px, but that's because screens back them used to be small compared to
today's screens. 1360 vs 1960. i want to redesign but keep the look & feel of holo cms. my idea is use today's sizes
like font-size: 16px. and make the layout's a little bigger to match this new font-size."

# Behaviours

Written with the user when the feature is planned.

# Open questions

- The ten questions of [the redesign
  study](/features/look-and-feel/research-redesign.md#questions-for-the-owner-recommended-answer-first): what is
  redesigned, whether it replaces "exactly as Holo" for sizes only
  ([holo-port 0034](/decisions/holo-port/0034-behaviour-matches-holo.md)), the font and its size, fixed or fluid, the
  factor, avatars and badges, home pages, the Help Tool, screenshot baselines, the order.
- Whether the differences from HoloCMS are fixed on today's 11px layout first, or with the redesign.
- Of [the comparison](/features/look-and-feel/research-holo-look.md): whether Holo's tab image `tabs.png` is copied or
  its look redrawn in CSS, and where the font is set, on the community layout alone or for the whole site.
