# Spec: 010 — Member Classes (19 media types)

**Feature**: `010-member-classes` | **Date**: 2026-09-10 | **Depends on**: 002/003/005/007 (before implement).

## Scope

Wire the 19 member media classes in `src/engine/core/media/`:

- **8 functional** (real bodies exposing payload data, NO rendering — 008 renders):
  Bitmap (`media/bitmap-member.js`, exists — verify real), Field, Text, Sound, plus **5 missing
  to author from `docs/drmx2004_scripting_ref/media_types.txt` with verbatim JSDoc**:
  Button, ColorPalette, Cursor, Font.
- **11 excluded stubs** (documented empty surface, verbatim JSDoc only — media_types.txt):
  AnimatedGIF, DVD, FilmLoop, FlashComponent, LinkedMovie, QuickTime, RealMedia,
  Shockwave3D, ShockwaveAudio, VectorShape, WindowsMedia. (Flash exists in `media/` — retire or
  reclassify.)

## Decisions pending at clarify

- Missing-5 authoring: media_types.txt only lists method/property summaries; full verbatim
  JSDoc source = properties.txt/methods.txt per property/method (the existing 15 files show the
  pattern).
- Member number/name canonicality via 007 ingest (already done) — 010 just exposes data.
- `payload` shapes: bitmap `{data,width,height}` (base64 data URI), sound `{audioBytes}`,
  field/text `{text}`, button `{text,width,height}`, colorPalette `{colors}`, cursor `{glyph}`,
  font `{glyphs}` (mirror `pack/cast.js` builder opts).

## Verification

- Gate `pnpm --filter @project-reborn/director test` (303+).
- New `media/__tests__/` — per functional class: payload passthrough + JSDoc presence; per
  stub: empty-but-exported + JSDoc presence.
- 007 builder-shape + 008 ingest-habbo still consume `payload` shapes unchanged.