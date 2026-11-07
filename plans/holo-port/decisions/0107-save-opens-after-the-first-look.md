---
type: Decision
title: Save changes opens five seconds after the editor's first look
description: The CMS's wrapper of the avatar editor opens the looks form's Save changes five seconds after the editor shows its first look, unless the club notice showed or the look changed meanwhile, as Holo's Flash editor did, when the page loads and after a green arrow of the wardrobe.
status: accepted
timestamp: 2026-11-07T02:22:16+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-07T02:22:16+00:00"}
tags: [account, editor, holo]
---

# Decision

- `packages/cms/src/components/habbo/avatar-editor.svelte`, the CMS's wrapper of the avatar editor, enables Save
  changes five seconds after the editor shows its first look, unless the club notice showed or the look changed
  meanwhile, as Holo's Flash editor did.
- This happens when the page loads and after a green arrow of the wardrobe starts the editor again.
- `vendor/HabboWidgets` stays untouched: it is Quackster's repository.

# Context

[p6-06](/tasks/p6-06-club-wardrobe.md) found in the decompiled Flash editor that Holo's Save changes opened five
seconds after the editor started with a look the club allows, where the HTML5 editor of `vendor/HabboWidgets` keeps it
closed until it is touched ([p6-12](/tasks/p6-12-save-looks-as-the-flash-editor.md)). The user chose "In our wrapper
(Recommended)" over changing the HTML5 editor in `vendor/HabboWidgets`, which would need a fork or a carried patch,
and over changing nothing.

# Consequences

- [p2-04](/tasks/p2-04-account-looks.md)'s note that Holo keeps Save changes closed until the editor is touched was
  wrong, and is corrected.
- The registration form and the Habbos page use the wrapper without a Save button, and stay as they are.
