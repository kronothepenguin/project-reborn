---
type: Decision
title: The credits page boxes are BBCode with their pictures in the page
description: The two text boxes of the credits page are BBCode like the staff page boxes, each picture sits beside its text as part of the page, and the second box's list becomes lines starting with '* '.
status: accepted
timestamp: 2026-11-06T22:30:17+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-06T22:30:17+00:00"}
tags: [economy, settings, bbcode]
---

# Decision

- The bodies of the credits page's two boxes, `What are credits?` and `Get credits!`, are BBCode, rendered by
  `packages/cms/internal/bbcode` like the staff page boxes ([0077](/decisions/0077-staff-boxes-in-bbcode.md)), and
  edited in housekeeping in the BBCode editor ([0092](/decisions/0092-bbcode-editor.md)).
- Each box's picture is part of the page, beside the text: `credits_permission.png` in the first, as Holo's
  `credits.php` already has it, and the palm chair of Holo's default text in the second.
- The second box's list becomes lines that start with `* `, as Holo's list items already showed.

# Context

Holo stored both boxes as raw HTML in `cms_content` (`credits1`, `credits2` and their headings), and `credits2`'s
default holds the palm chair picture and a list of four ways to earn credits. BBCode has no pictures or lists. Offered
BBCode with the pictures fixed in the page, or HTML as Holo's with unsafe tags stripped, the user chose "BBCode,
pictures fixed (Recommended)".

# Consequences

- The boxes keep Holo's fixed colours, blue for the first and green for the second; they get no colour setting.
