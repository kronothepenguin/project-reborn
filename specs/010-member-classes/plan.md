# Implementation Plan: 010 — Member Classes (19 media types)

**Branch**: `010-member-classes` | **Date**: 2026-09-10 | **Spec**: [/specs/010-member-classes/spec.md](./spec.md)

## Summary

Author the 5 missing functional member classes (Button, ColorPalette, Cursor, Font, Sound)
from `media_types.txt` (verbatim JSDoc + documented plain fields, D2), add a `media/index.js`
barrel exported from `engine/core/index.js`, and make `MovieObject.newMember(type)` real
(D1): type → class, set the type symbol, register into the first empty castLib slot via the
active context. The 11 excluded stubs already exist — verified by tests.

## Phases

### Phase 1 — Author missing classes + barrel (T001–T005)
button/color-palette/cursor/font/sound-member.js + media/index.js + engine/core/index.js
export. RED: media-classes.test.js (surface + defaults).

### Phase 2 — Real newMember (T006–T008)
MovieObject.newMember — type map, symbol set, first-empty-slot registration, no-context
fallback. RED: newMember tests.

### Phase 3 — Docs + review + commit (T009–T011)
roadmap row (010 done), quickstart, review before commit.

**Gate**: `pnpm --filter @project-reborn/director test` (328 baseline; must stay green).

**Out of scope**: media rendering (008), scripting objects (011), payload mirroring (D2 no).