# Spec: 009 — Browser (custom elements over the player)

**Feature**: `009-browser` | **Branch**: `009-browser` | **Date**: 2026-09-09
**Depends on**: 008 (`run()`, committed `b5bf80cb`) + 007 (packs, `8c7fe620`). Both ✅.

## Problem statement

The 008 player is imperative: `run(bundleUrl, {canvas, externalParams})` returns a
handle. But Shockwave movies were *declared* — `<embed src="habbo.dcr">`. The
browser layer must restore that declarative path: `<x-embed src="…/habbo/index.js">`
plus `<x-param>` children, backed 1:1 by the imperative handle (SC-010 equivalence),
replacing the legacy HTML4 `<object>`/`<embed>`/`<param>` + NPAPI surface.

**The current `src/browser/custom-elements/` code is pre-008**: it drives a fake
`_createMovie({src,tempo,…})` plain object + `startEventLoop` + `loadCast()`. It
must be rewritten to be a **thin wrapper over 008's `run()`** — no separate
runtime path.

## Goal

1. Rewrite `<x-object>` + `<x-embed>` (equivalent surface) to call `run()` on
   connect: read `src`/`data` bundle URL, insert sized `<canvas>`, collect
   `<x-param>` snapshot → `externalParams`, pass the canvas, re-dispatch
   `externalEvent`/`error`/`gotoNetMovie`/`gotoNetPage` as DOM `CustomEvent`s,
   forward input events (translated to stage space), `disconnectedCallback` →
   `handle.destroy()`.
2. Paint fallback: when `OffscreenCanvas` is unavailable, the worker posts
   `paint` messages (008) — the handle relays them, the element draws the
   `ImageData` onto its DOM canvas.
3. SC-010 equivalence test: element-installed surface ≡ imperative `run()`
   surface (same handle semantics; element is a wrapper).

## Clarify decisions (proposed — user to confirm)

- **C1 — surface**: attributes `src` (alias `data`) required; `width`/`height`
  default 640×480 (CSS px); optional `tempo` (overrides pack `options.tempo`
  only if present). No Shockwave-era plugin attrs (`swStretchStyle`, `menu`,
  `console`, `bgColor`) in v1 — absent/ignored. Both tags identical; `x-object`
  kept only for old-doc compat.
- **C2 — params**: `<x-param name value>` children collected at `connectedCallback`
  into the `externalParams` snapshot (order preserved). Post-connect mutations
  ignored (stale snapshot — 001 contract, documented; no MutationObserver).
- **C3 — input**: listeners on the element for `keydown/keyup/mousedown/mouseup/
  mousemove/focus/blur`; mouse coords translated element-relative → stage space
  (scale by `stageWidth/el.clientWidth`, y-flip handled worker-side in 008
  `input.js`); forwarded via `handle.post(kind, payload)` (the 001 protocol
  shape — same channel as init/start).
- **C4 — canvas & paint fallback**: element creates the `<canvas>`; 008's
  `run()` already calls `transferControlToOffscreen()` when available. 009 adds
  a `paint` relay to the handle (`CustomEvent("paint", {detail:{imageData,…}})`)
  when the transfer path isn't used (jsdom/no-OffscreenCanvas); element paints
  `detail.imageData` onto the canvas via `ctx.putImageData`.
- **C5 — lifecycle**: `connectedCallback` → `run()` → `start()` after `ready`
  (auto-start on connect; `stop()` not exposed declaratively). `disconnectedCallback`
  → `destroy()` (idempotent). Element exposes `.handle`, `.movieName`, `.frame`
  (via `poll()`) for debugging only.

## Supersedes 001

US8 / FR-029 / FR-030 (element surface), SC-010 (equivalence) — the old
element↔player wires are replaced by the 008 handle; `_createMovie`, `_setCanvas`,
`loadCast` flow deleted from the element paths.

## Out of scope

- `<x-object>` scripting API differences (legacy BS_… methods).
- Stage resize / responsive re-render (fixed width/height; CSS scales the canvas).
- 003 sprite-object bodies (hit test etc.) — input still just feeds `_key`/`_mouse`.
- The old `x-object`'s `tempo` setter / `movie` getter parity with 001 (drop).

## Verification

- jsdom tests: define elements, attach `<x-embed>` with a fake `run`-produced
  handle or a mock Worker (008 test pattern), assert: canvas inserted + sized,
  params snapshot passed, `start` after `ready`, `externalEvent` re-dispatched,
  input forwarded translated, `paint` drawn, `disconnectedCallback` → destroy.
- SC-010: same movie via element vs `run()` → same handle-kind, same events.
- Gate: `pnpm --filter @project-reborn/director test` (288 green before; must
  stay green).