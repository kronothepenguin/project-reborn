# Implementation Plan: 003 — Functional Sprites (Sprite ↔ Score)

**Branch**: `003-engine-core` | **Date**: 2026-09-10 | **Spec**: [/specs/003-engine-core/spec.md](./spec.md)

**Input**: 004 Score shape (`channel(n)` → cell `{member, ...placement}`, `populatedChannels`,
`advance`), `context.frameStep()` (dispatch site), 006 accessor (`_getMovie`/`_getPlayer`),
008 ingest (cells hydrated by 008 renderer too).

## Summary

Make `sprite(n)` resolve a live `SpriteObject` in the current frame. Add a **context-level
puppet register** (user decision): `puppetSprite` puts a live scripted sprite in the register;
channel resolution = register first, Score cell second. `hitTest(point)` returns the live
topmost `SpriteObject` under the point (else VOID). `constrainH/V` + `constraint` clamp live
sprites. `frameStep` dispatches `beginSprite`/`endSprite` carrying `detail.sprite` = the live
`SpriteObject`. All fields stay plain documented fields; hydration logic lives in a
subsystem-side helper (`sprite-hydrate.js` or on context methods) so classes keep FR-005 purity.

## Technical Context

- **Language**: JS ES modules; jsdom env; zero deps.
- **Testing**: co-located `__tests__/`; red-green per task; mock via real
  `DirectorContext` + `ingestDefinition` fixtures (returns live `SpriteObject`s).
- **Gate**: `pnpm --filter @project-reborn/director test` — 303 green baseline.

## R decisions

- **R1 — resolution path**: `context.sprite(n)` (public method on `DirectorContext`) →
  puppet register → `score.channel(n)` → hydrated `SpriteObject` (or `null`/stage).
  `api/methods/sprite.js` re-points `_getMovie().sprite[nameOrNum]` to this path.
- **R2 — hydration**: `hydrateSprite(ctx, sprite, cell)` — copies placement fields
  (`loc/locH/locV/width/height/visible/member/puppet/left/top/right/bottom/rect/ink/blend/
  rotation`) onto the live object. Called per `frameStep` for populated channels; puppet sprites
  hydrate on `puppetSprite(TRUE)`.
- **R3 — puppet register**: `ctx.puppetSprites = new Map()` (channel → SpriteObject).
  `ctx.puppetSprite(n, bool)`; `ctx.makeScriptedSprite(n, member, loc)`;
  `ctx.removeScriptedSprite(n)`; `ctx.isScripted(n)`.
- **R4 — hitTest**: `SpriteObject.hitTest(point)` curried to the active context; topmost by
  (locZ, channel) where `locZ` defaults to channel; bounds = left/top/right/bottom (updates
  `rect`). Returns the `SpriteObject` or `VOID` (symbol from 002 base).
- **R5 — constraint/clamp**: `MovieObject.constrainH/V` delegate to context helper clamping a
  sprite's `loc` inside the constrainer sprite's `left/top/right/bottom`. Sprite `constraint`
  field honored in `hitTest`/clamp helper (tests assert clamp; hover-level constraint UX not
  simulated).
- **R6 — lifecycle dispatch**: `context.frameStep()` currently builds events per populated
  channel with raw `cell` — swap to hydrated live sprites (`spriteObj`), keep `channel` + `cell`
  in detail for backward-compat 008 renderer.
- **R7 — api/methods/sprite.js**: `sprite(n)` → `_getMovie().context.sprite(n)` (or the
  accessor's active context), never the stale `movie.sprite` map.

## Phases

### Phase A — Resolution + hydration (T001–T005)
R1/R2/R7: context.sprite(n), hydrate helper, api/sprite.js re-point. RED tests:
sprite(n) live, fields hydrated from cell, stage sprite(0), unknown channel → null.

### Phase B — Puppet register (T006–T010)
R3 + R4 (puppetSprite, makeScriptedSprite, remove, preemption). RED: register preempts
Score; FALSE restores; makeScripted sets loc/center default.

### Phase C — hitTest + constraint (T011–T015)
R4/R5. RED: topmost bounds test, VOID, constrainH/V clamp, constraint field.

### Phase D — Live lifecycle (T016–T018)
R6: frameStep dispatch live refs; 008 renderer still green. RED: begin/endSprite events carry
`detail.sprite`.

### Phase E — Docs + review + commit (T019–T021)
roadmap status, quickstart, review before commit.

**Verification**: full gate after each phase; final gate 303+.

**Out of scope**: member classes (010), scripting objects (011), renderer composition ops
(008-later).