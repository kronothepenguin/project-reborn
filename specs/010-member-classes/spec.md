# Spec: 010 — Member Classes (19 media types)

**Feature**: `010-member-classes` | **Date**: 2026-09-10 | **Depends on**: 002/003/005/007 (before implement).

## Scope

Wire the 19 member media classes in `src/engine/core/media/`:

- **8 functional** (real bodies exposing documented Director fields, NO rendering — 008
  renders): Bitmap (`media/bitmap-member.js`, exists), Field, Text, plus **5 missing
  to author from `docs/drmx2004_scripting_ref/media_types.txt` with verbatim JSDoc**:
  Button, ColorPalette, Cursor, Font, Sound.
- **11 excluded stubs** (documented empty surface, verbatim JSDoc only — media_types.txt):
  AnimatedGIF, DVD, FilmLoop, FlashComponent, LinkedMovie, QuickTime, RealMedia,
  Shockwave3D, ShockwaveAudio, VectorShape, WindowsMedia. (Flash exists in `media/` —
  keep as a stub, unclassified.)

## Clarify decisions (confirmed)

- **D1 — Real `newMember`**: `MovieObject.newMember(type)` maps the type to its media class
  (e.g. `#button`/`"button"` → `ButtonMember`), sets the documented `type` symbol, and when an
  active context exists registers the member in the **first empty cast library slot**
  (MemberRegistry assigns the next free number per castLib). Returns the member.
- **D2 — Documented fields only**: no payload mirroring. The pack payload stays on
  `MemberObject.payload` (008 reads it there); media classes expose ONLY the documented
  Director fields (verbatim JSDoc + sensible plain defaults).

## Missing-5 documented surface (media_types.txt)

| Class | Docs quote | Surface |
|---|---|---|
| ButtonMember | "Represents a button or check box cast member." | prop `hilite` |
| ColorPaletteMember | "Represents the color palette associated with a bitmap cast member..." | method `color()`, props `palette`, `paletteMapping`, `depth` |
| CursorMember | "Represents a cursor cast member." | props `castMemberList`, `cursorSize`, `hotSpot`, `interval` |
| FontMember | "Represents a font cast member." | props `bitmapSizes`, `characterSet`, `fontStyle`, `originalFont`, `recordFont` |
| SoundMember | "Represents a cast member that is used to store and refer to sound samples..." | no APIs of its own (Member surface only) |

## Verification

- Gate `pnpm --filter @project-reborn/director test` (328+).
- New `media/__tests__/media-classes.test.js` — each functional class: exists, extends
  MemberObject, documented fields present with defaults; stubs: 11 files export empty-but-
  documented classes.
- `newMember` tests — type mapping (symbol + string), symbol set, first-empty-slot
  registration, no-active-context fallback returns unregistered member.
- 008/007 gates stay green (payload shape unchanged).