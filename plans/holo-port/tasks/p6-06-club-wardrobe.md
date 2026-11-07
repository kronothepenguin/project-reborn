---
type: Task
title: Keep outfits in the club wardrobe
description: Club members get Holo's wardrobe under the avatar editor on /account/looks, whose red arrows store the look in a slot and green arrows put a stored outfit back in the editor.
status: done
phase: p6
depends_on: [p6-01, p6-02]
packages: [packages/cms, tests/e2e]
holo: [source/holocms/account.php, source/holocms/wardrobestore.php, source/holocms/web-gallery/static/js/settings.js]
timestamp: 2026-11-07T00:46:14+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-06T22:30:17+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-07T00:46:14+00:00"}
---

# Goal

A club member keeps up to `homes.wardrobeSlots` outfits for each habbo and dresses in them.

# Steps

- [x] `/account/looks` shows club members Holo's wardrobe (`account/wardrobe`) under the editor: one slot per
  `homes.wardrobeSlots`, each with its outfit's picture from `imaging.avatarUrl` (size `s`, direction 4, head
  direction 4, gesture `sml`), a red store arrow, and a green dress arrow once it holds an outfit.
- [x] Hovering the wardrobe shows Holo's instructions bubble, with the number of slots.
- [x] A red arrow stores the editor's look in its slot, after Holo's `Replace?` dialog when the slot holds one.
  `POST /account/looks/wardrobe/{slot}` takes the look of the active habbo, from a club member only, in a slot of
  `homes.wardrobeSlots`, checked as the looks form checks it, and answers the outfit's picture; anything else answers
  the error that shows `Error! This outfit cannot be saved.`
- [x] A green arrow puts the outfit in the editor, which starts again with it and the club's choices, as Holo's
  `swfobj.write` did; saving the looks form then wears it.
- [x] Router tests, and a `looks` browser suite: no wardrobe outside the club, storing, replacing after the dialog,
  dressing and saving, and a refused slot.
- [x] The differences in [Holo's differences](/reference/holo-differences.md): outfits per habbo, the store open to
  club members only, and a bad slot or gender refused instead of turned into slot 1 or `M`.

# Verification

```sh
# gofmt, go vet and go test -race in packages/cms; pnpm check in packages/cms
cd tests/e2e && node run.mjs looks
```

Results (2026-11-07T00:46:14+00:00):

- `gofmt` lists nothing, and `go vet` and `go test -race` pass in `packages/cms`. `packages/cms` has no `pnpm check`:
  `svelte-check`, run from `packages/components` on `packages/cms`, finds nothing in `account/wardrobe` and
  `habbo/avatar-editor`, whose window types moved into a module script, where `declare global` takes effect, which
  also clears the editor's seven errors of `main`; the two errors of `landing/promo-widget` and the warning of
  `homes/note-editor` were there before. `pnpm build` passes, and the island guard too: My Groups stays the page's
  first island, outside any template block.
- The router tests: outside the club the page has no wardrobe and the store refuses, after an ended period too; in it
  the page has five empty slots and a store answers the outfit's picture; outfits list by slot with their pictures, a
  slot takes a new outfit over its own, and the looks form wears a dressed outfit; a second habbo of the user starts
  with an empty wardrobe and both keep their own; slot 0, 6 of 5, -1 and `x`, no gender, `U`, `m`, no figure, a
  malformed one and one of 258 characters answer `invalid` with 422 and store nothing; with three slots the page lists
  the first three, slot 4 is refused and the outfit of slot 5 stays stored, ready for six slots; a guest gets 401, a
  body that is not an outfit 400 and a cross-site post 403; the picture follows `imaging.avatarUrl`.
- Breaking these on purpose fails a test, 12 of 12: the store taking users outside the club, any slot up to 20, slot 0
  and below or any look, or keeping the outfit under the user's id; the page listing outfits beyond its slots, or
  showing the wardrobe or saying `Club` outside the club; the picture big, facing another way or not smiling; and the
  route open to guests.
- `pnpm test looks`, which runs `node run.mjs looks`, passes all 32 checks. Admin-1 finds no wardrobe outside the
  club; in it, five empty slots with red arrows and no green ones; hovering shows Holo's instructions with 5 outfits,
  585 pixels into the content and 17 above the slots, and leaving hides them. A red arrow keeps the editor's look with
  its picture; two looks of Randomize go to slot 2 and over slot 1, where Holo's `Replace?` asks first, Cancel keeps
  the outfit and OK, over slot 2, replaces it. A green arrow puts outfit 1 in the form at once and starts the editor
  again with it and the club's choices; the green arrow of the outfit the editor shows does nothing; two green arrows
  pressed while the editor loads end on the second's outfit, after the first's. Saving wears the outfit, and the
  wardrobe keeps both. With `homes.wardrobeSlots` lowered to 3 while the page is open, slot 5 answers Holo's alert and
  stays empty, and the page then shows three slots and says so. The screenshots `looks-wardrobe-instructions`,
  `looks-wardrobe-replace` and `looks-wardrobe-dressed` were read by eye.
- Breaking these on purpose fails a check, 10 of 10: a green arrow on every slot, as Holo showed them; no `Replace?`
  question; the slot taking the outfit before the answer; the instructions 15 pixels further right, or saying 5
  outfits whatever the slots; the alert in other words; a green arrow restarting the editor with the outfit it shows;
  the form taking the outfit only once the editor has started again; the editor starting again without the club's
  choices; and a green arrow restarting an editor that is still loading, which then never reports its look.

# Notes

- Holo's style floats the editor left, so its wardrobe, which follows the editor in the page, stands at its right as a
  column of 67-pixel slots, 46 pixels below the editor's top; the port keeps that place, Holo's images and its
  `wardrobe-slot-N`, `wardrobe-store-N` and `wardrobe-dress-N`, the arrows being buttons with labels.
- Holo's `#wardrobe-instructions` stood 585 pixels from the page's left edge, so it moved with the window's width;
  the port measures the 585 pixels from the 930-pixel content, as wide as Holo's, which puts the bubble 95 pixels left
  of the slots, where the tail of Holo's image pointed into them. The `Bubble` of `packages/components` draws it, as
  the random habbos' tooltip: 256 pixels wide where Holo's was 270, with its tail at its left where Holo's stood in its
  middle. Its box ends 17 pixels above the slots, as Holo's did above its 10-pixel tail. Keyboard focus shows it too.
- The `Replace?` dialog is the 398-pixel orange box of the Moderation Tools, centred and not draggable.
- A refused outfit shows the browser's alert with Holo's text, as `settings.js` did.
- A green arrow sends a `restart` event to `#editor-container`, which `habbo/avatar-editor` answers as Holo's
  `HabboEditor.setGender`, `setFigure` and `swfobj.write` did: the form takes the outfit at once, and a new
  `HabboAvatarEditor` starts on the emptied container from `window.HabboEditorConfig` with the outfit, the club's
  choices staying on as the looks page starts the editor with them. The HTML5 editor cannot be stopped, so an arrow
  pressed while one loads waits for that one's first look, after which it never touches the container again; its
  five-second block may still answer Save changes once, before the new editor's, which ends last.
- Save changes after a green arrow stays closed until the editor is touched, as after the page loads
  ([p2-04](/tasks/p2-04-account-looks.md)); the suite opens it as the editor does once touched. Holo's Flash opened it
  five seconds after it started: [p6-12](/tasks/p6-12-save-looks-as-the-flash-editor.md).
- The page and the store read the club with `inClub`, a period covering now, as the home editor's club skins do;
  `data-club` stays on `ClubDays`, as p2-04 set it.
- Outfits in slots above a lowered `homes.wardrobeSlots` stay stored, out of sight, and come back when it rises.
- The editor is `packages/cms/public/habbo-editor.iife.js`, built from `vendor/HabboWidgets`; it exposes
  `window.HabboAvatarEditor`, which starts on a container with a config.
