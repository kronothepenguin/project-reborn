# Implementation Plan: 009 — Browser (custom elements over 008's run())

**Branch**: `009-browser` | **Date**: 2026-09-09 | **Spec**: [/specs/009-browser/spec.md](./spec.md)

**Input**: spec 009 (C1–C5 confirmed), 001 contracts `custom-elements.md` +
`imperative-runtime.md`, 008 `run.js` handle surface, current
`src/browser/custom-elements/index.js` (pre-008 — to be rewritten).

## Summary

Rewrite `<x-object>`/`<x-embed>`/`<x-param>` as a **thin wrapper** over 008's
`run()`: on connect, read src/data + width/height (+tempo), insert `<canvas>`,
snapshot `<x-param>`s → `externalParams`, call `run()`, relay the handle's
`externalEvent`/`error`/`gotoNetMovie`/`gotoNetPage` (and new `paint`) onto the
element, forward input events (stage-translated), destroy on disconnect. Add the
`paint` relay to `run.js`'s handle (008 C5 gap: the worker's paint fallback
messages are currently dropped on the main thread). Equivalence proven by SC-010
tests: element vs imperative handle behave identically.

## Technical Context

- **Language**: JS ES modules; jsdom test env; `customElements` + `HTMLElement`
  available in jsdom.
- **Testing**: tests use the 008 pattern — mock `Worker` (in-process EventTarget
  shim) + `run(definition)` inline; assert DOM effects on the jsdom document.
  `OffscreenCanvas` absent in jsdom → paint-fallback path exercised (C4/C5).
- **Gate**: `pnpm --filter @project-reborn/director test` — 288 green before.

## R decisions

- **R1 — element factory**: `src/browser/custom-elements/index.js` exports
  `defineCustomElements()` (idempotent) + `createXEmbedElement()`. Builders
  `element(name)` style not needed; tags registered under `x-object`, `x-embed`,
  `x-param`. **Delete** `_createMovie`, `_setCanvas` wiring, `loadCast`/`startEventLoop`
  imports — replaced by `run()`.
- **R2 — run.js paint relay**: `_onMessage` gains `paint` — dispatch
  `CustomEvent("paint", { detail: { imageData, width, height, seq } })` on the
  handle (mirrors worker 008 renderer). No recollection; seq last-wins left to
  the element.
- **R3 — element wiring**: 
  ```js
  const handle = run(src, { canvas, externalParams });
  this._handle = handle;
  for (const t of ["externalEvent","error","gotoNetMovie","gotoNetPage","paint"])
    handle.addEventListener(t, (e) => this.dispatchEvent(new CustomEvent(t, { detail: e.detail, bubbles: false })));
  handle.addEventListener("ready", () => handle.start());
  ```
  Input listeners on the element; `toStagePoint(e)` = scale
  `(e.clientX - elBounds.left) / elBounds.width * stageWidth` (same for y);
  forward `handle.post(kind, {key,keyCode,clientX,clientY})` per C3.
- **R4 — canvas**: element-created `<canvas width=height=stage>`, CSS 100%×100%,
  display block; appended before `run()` (transfer needs a live canvas).
- **R5 — debug getters**: `.handle`, `.movieName` (`handle` has none → poll digest:
  `frame` from `poll()`), `.frame`. Minor: expose `handle`; `movieName`/`frame`
  via a light `_refreshState()` on `poll-lifecycle` replies. Keep tiny.
- **R6 — registrations**: `registerCustomElements()` (kept name, but now also
  ensures element classes; auto-register at import when `customElements` exists).

## Phases

## Phase A — Handle relay + element rewrite (T001–T004)
R2 (paint relay + test) then R1/R3–R6 rewrite of custom-elements + tests.
RED: paint relay test (paint message → handle event), element connect test
(canvas + externalParams + start-after-ready), input translation test,
externalEvent relay, disconnect → destroy.

## Phase B — SC-010 equivalence (T005)
Assert same movie via `<x-embed>` vs `run()`: same event kinds, same paint
surfaces, same param snapshot → same `externalParams` on init. RED → green.

## Phase C — Docs + review + commit (T006–T008)
roadmap 009 row, quickstart, review before commit.

**Verification**: full gate green; jsdom element tests green.

**Out of scope**: 003 sprite hit-test bodies; responsive resize; Shockwave-era
plugin attributes; the deleted `x-object`-only legacy API surface.