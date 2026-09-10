# Tasks: 010 — Member Classes (19 media types)

**Gate**: `pnpm --filter @project-reborn/director test` (328 green before).

## Phase 1 — Author missing classes + barrel
- [x] T001 — `button-member.js`: ButtonMember (hilite), verbatim JSDoc from media_types.txt.
- [x] T002 — `color-palette-member.js`: ColorPaletteMember (color(), palette, paletteMapping, depth).
- [x] T003 — `cursor-member.js` (castMemberList, cursorSize, hotSpot, interval) + `font-member.js` (bitmapSizes, characterSet, fontStyle, originalFont, recordFont).
- [x] T004 — `sound-member.js` (no APIs of its own — Member surface only).
- [x] T005 — `media/index.js` barrel (all 19) + export from `engine/core/index.js`. RED: media-classes.test.js (exists/extends/fields/JSDoc; stubs empty-but-documented).

## Phase 2 — Real newMember
- [x] T006 — Type map (`#button`/`"button"`/`"bitmap"`/... → class; unknown → MemberObject). RED: newMember.test.js.
- [x] T007 — `newMember` sets `.type` symbol (Lingo `#` semantics, e.g. `Symbol.for("button")`).
- [x] T008 — First-empty-slot registration against the active context (registry assigns next free number per castLib); no active context → member returned unregistered.

## Phase 3 — Docs + review + commit
- [ ] T009 — roadmap status row (010 done).
- [ ] T010 — `specs/010-member-classes/quickstart.md` (newMember + class surface).
- [ ] T011 — Full gate + review summary before commit.