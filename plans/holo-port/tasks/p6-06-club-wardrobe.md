---
type: Task
title: Keep outfits in the club wardrobe
description: Club members get Holo's wardrobe under the avatar editor on /account/looks, whose red arrows store the look in a slot and green arrows put a stored outfit back in the editor.
status: todo
phase: p6
depends_on: [p6-01, p6-02]
packages: [packages/cms, tests/e2e]
holo: [source/holocms/account.php, source/holocms/wardrobestore.php, source/holocms/web-gallery/static/js/settings.js]
timestamp: 2026-11-06T22:30:17+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-06T22:30:17+00:00"}
---

# Goal

A club member keeps up to `homes.wardrobeSlots` outfits for each habbo and dresses in them.

# Steps

- [ ] `/account/looks` shows club members Holo's wardrobe (`account/wardrobe`) under the editor: one slot per
  `homes.wardrobeSlots`, each with its outfit's picture from `imaging.avatarUrl` (size `s`, direction 4, head
  direction 4, gesture `sml`), a red store arrow, and a green dress arrow once it holds an outfit.
- [ ] Hovering the wardrobe shows Holo's instructions bubble, with the number of slots.
- [ ] A red arrow stores the editor's look in its slot, after Holo's `Replace?` dialog when the slot holds one.
  `POST /account/looks/wardrobe/{slot}` takes the look of the active habbo, from a club member only, in a slot of
  `homes.wardrobeSlots`, checked as the looks form checks it, and answers the outfit's picture; anything else answers
  the error that shows `Error! This outfit cannot be saved.`
- [ ] A green arrow puts the outfit in the editor, which starts again with it and the club's choices, as Holo's
  `swfobj.write` did; saving the looks form then wears it.
- [ ] Router tests, and a `looks` browser suite: no wardrobe outside the club, storing, replacing after the dialog,
  dressing and saving, and a refused slot.
- [ ] The differences in [Holo's differences](/reference/holo-differences.md): outfits per habbo, the store open to
  club members only, and a bad slot or gender refused instead of turned into slot 1 or `M`.

# Verification

```sh
# gofmt, go vet and go test -race in packages/cms; pnpm check in packages/cms
cd tests/e2e && node run.mjs looks
```

# Notes

- The editor is `packages/cms/public/habbo-editor.iife.js`, built from `vendor/HabboWidgets`; it exposes
  `window.HabboAvatarEditor`, which starts on a container with a config.
