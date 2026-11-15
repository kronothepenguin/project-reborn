---
type: Plan
title: "Homes: how"
description: The CMS draws and edits homes and sells their items, the store keeps them, and housekeeping manages the Webstore.
---

# Architecture

| Project | Part |
| --- | --- |
| `packages/cms` | The home page, the home editor island, the Webstore and inventory dialogs, the note editor, the art in `public/c_images/`, and in `seed/` the ids of the Backgrounds and Notes categories and the art the items show |
| `packages/store` | Homes, home items, the inventory and the ledger; the update `0002-home-store.sql` writes Holo's store |
| `packages/housekeeping` | `/housekeeping/home-store`: add, edit and stop selling items |
| `packages/components` | The BBCode editor of the notes |

The home editor's inside is in `packages/cms/knowledge/islands.md`, and the art in `packages/cms/knowledge/art.md`.

# Decisions

- [The art lives in the repository](/decisions/holo-port/0061-art-in-the-repository.md) — The home art and user badges
  are committed under packages/cms/public and embedded in the CMS binary.
- [Home backgrounds are unlocks](/decisions/holo-port/0064-backgrounds-are-unlocks.md) — A background is bought once and
  any home of the user's habbos shows it; stickers and notes belong to the user while not placed.
- [Users edit the homes of all their habbos](/decisions/holo-port/0065-owners-edit-all-their-homes.md) — A user
  edits the home of any habbo they own, whichever of their habbos is active.
- [A WYSIWYG BBCode editor of our own wherever BBCode is
  written](/decisions/holo-port/0092-bbcode-editor.md) — Notes are written in the shared BBCode editor.
- [An archived habbo's stickers stay on group
  homes](/decisions/holo-port/0096-archived-habbos-stickers-stay-on-group-homes.md) — Archiving a habbo returns only the
  stickers and notes of its own home.
- [Notes removed from a group home go back to their
  placers](/decisions/holo-port/0098-group-home-notes-go-back-to-their-placers.md) — On a habbo's own home a removed
  note is deleted for good, with Holo's warning.

# Notes

- Holo's Webstore fixed its main categories in HTML: Backgrounds and Notes hold one category each, and Stickers every
  other one. `seed.BackgroundsCategory` and `seed.NotesCategory` keep that.
- Holo's skins are `src/styles/homes.css`, turned from `skins.css` by a script and keyed by `data-widget-skin` and
  `data-note-skin`, since an item's skin is runtime data.
- Each habbo's home starts with its profile widget, written with the habbo. Holo wrote it on the first view.
- The page draws the playground and the island enhances its items, as Holo's `homeedit.js` did, so a home looks the
  same with and without JavaScript.
- The note editor offers the six skins of Holo's note editor; the edit menu adds the club and staff skins for those who
  may use them. The note's preview uses `POST /bbcode/preview`.
- In housekeeping the quantity has the same cap as the price, because every purchase adds it to an inventory. The
  page reads the whole store, about 300 items, and pages it in Go.
