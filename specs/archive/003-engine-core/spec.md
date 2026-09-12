# Spec: 003 — Engine Core: Functional Sprites (Sprite ↔ Score)

**Feature**: `003-engine-core` | **Branch**: `003-engine-core` | **Date**: 2026-09-10
**Depends on**: 002, 004 (Score/context), 006 (accessor/singletons), 008 (renderer/ingest).
**Split**: 003 = functional sprites (this spec); 010 = member classes (19); 011 = scripting objects (4).

## Problem statement

`SpriteObject`/`SpriteChannelObject` in `src/engine/core/` are documented **field shells**
(verbatim JSDoc, all method bodies stubbed). The 004 Score is live (frame cells by channel,
playhead, `advance`, markers) and `context.frameStep()` already dispatches `beginSprite`/`endSprite`
— but with **raw cell data**, not live sprite objects. `movie.puppetSprite()`/`constrainH/V` are
empty; `sprite(n)` reads `_movie.sprite[nameOrNum]` which is never populated; `hitTest` returns
placeholder strings. Translated Habbo scripts that call `sprite(n).loc`, `puppetSprite(n, TRUE)`,
`sprite(n).hitTest(point)`, and `constrainH(n, pos)` have no runtime to return against.

## Goal

1. **Live sprite resolution**: `sprite(n)` returns a live `SpriteObject` for the current frame's
   channel `n` (0 = stage), bound to the active context. Cells from Score (004 shape
   `{member, ...placement}`) hydrate the sprite's fields (`loc/locH/locV`, `width/height`,
   `visible`, `member`, `puppet`, …) on every `frameStep`.
2. **Context-level puppet register (user decision)**: `puppetSprite(n, TRUE)` registers a live
   `SpriteObject` on the context's puppet register (keyed by channel); channel resolution checks
   the register first, Score cell second. `puppetSprite(n, FALSE)` removes the register entry and
   restores Score control. `SpriteChannelObject.makeScriptedSprite(member, loc)` creates a
   scripted sprite in the register; `removeScriptedSprite()` removes it.
3. **hitTest (user decision)**: `SpriteObject.hitTest(point)` returns the live `SpriteObject`
   whose bounds contain the point (topmost by channel/Z), else `VOID`. The top-level
   `hitTest(spriteRef, testPoint)` delegates (already does). Non-live (Flash) symbol returns stay
   on excluded media stubs only.
4. **constraint/clamp**: `MovieObject.constrainH(constrainer, constrained)` and
   `constrainV` clamp the constrained sprite's `loc` to the constrainer's bounds; `SpriteObject`
   `constraint` field honors the same clamp on `loc` assignment via the documented property flow.
5. **Live lifecycle events**: `context.frameStep()` dispatches `beginSprite`/`endSprite` with
   **live `SpriteObject` refs** in `detail.sprite`.

## Decisions

- `sprite(0)` = stage → a stage sprite object (documented; `visible` etc. no-op safe).
- Puppet register lives on `DirectorContext` (FR-005: no statics; cross-class state in
  subsystem/context-owned instances). Keyed by channel number 1..48.
- No rendering changes here (008 flat-2D only; ink/rotation/blend fields remain data-only).
- Sprite fields stay plain documented fields (no `#private`/getters per AGENTS.md); the
  Score→sprite hydration happens in a small internal helper in the context/subsystem layer,
  not on the class (FR-005).

## Supersedes 001

FR-007/FR-010 (Sprite functional); FR-008 (hitTest real vs stubbed).

## Out of scope

- 010 (member class bodies incl. missing 5) and 011 (scripting objects) — separate features.
- Renderer ink/rotation/blend composition (008-later).
- `Window.openMovie`/MIAW (documented no-op).
- Fileio/net real I/O (011).

## Verification

- Gate: `pnpm --filter @project-reborn/director test` (303 green before; must stay green).
- New red-green tests:
  - `src/engine/core/__tests__/sprite-functional.test.js` — sprite(n) live resolution, field
    hydration from cell, stage sprite(0), channel-not-in-frame returns null, puppet register
    preempts Score, puppetSprite(FALSE) restores cell, makeScriptedSprite/removeScriptedSprite.
  - `src/engine/core/__tests__/hit-test.test.js` — hitTest topmost-by-channel, bounds check,
    VOID outside, stage point.
  - `src/engine/core/__tests__/constraint.test.js` — constrainH/V clamp, constraint field.
  - `src/engine/subsystem/__tests__/frame-step-sprite.test.js` — begin/endSprite dispatch live
    SpriteObject refs (not raw cells).