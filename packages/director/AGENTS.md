# AGENTS.md — `@project-reborn/director`

LingoScript→JS runtime + browser host integration (`@/lingo`, `@/browser`).

## Command Cheatsheet

```bash
pnpm --filter @project-reborn/director test      # vitest run (jsdom env + __test-shims__)
pnpm --filter @project-reborn/director exec vitest --project default  # alias
```

Tests live in co-located `__tests__/` folders, one test file per source file.

## Coding Conventions (enforced — spec FR-013/FR-005/FR-014)

These rules are **non-negotiable** for this package. They distill the canon files
(`objects/cast-library.js`, `member.js`, `mouse.js`, `global.js`, `key.js`,
`system.js`) and the Phase 1 refactor design (`specs/001-director-runtime/refactor.md`).

1. **No `#` private field syntax for documented properties/methods** (FR-013).
   The only allowed internal state is subsystem state (in `runtime/subsystems/`)
   that is NOT a documented member of a class.
2. **No `static` members of any kind on a class** (FR-005) — no static fields,
   no static getters, no static registries, no static `_reset`/`_register` helpers.
   Cross-class shared state lives in `runtime/subsystems/` instances owned by
   `DirectorContext`.
3. **No Proxy for documented properties** and no read-only enforcement via
   throwing setters. Plain public class fields with sensible documented defaults
   (`name = "";`, `number = 0;`, `hilite = false;`, `mediaReady = false;`).
4. **No getters/setters, no coercion** for documented properties — direct field
   assignment. Where the docs require clamping (e.g. Color RGB 0–255), the
   setter-style behavior lives in the method body that needs it, not as a getter/
   setter pair on the field. (See `types/color.js` for the Color exception where
   the docs themselves define RGB clamping.)
5. **One ES module per class; one `export class X…Object { … }`** (or `X…Member`
   for member media types). One JSDoc `/** … */` block above each documented
   property/method.
6. **All JSDoc quoted VERBATIM from `docs/drmx2004_scripting_ref/`** — the
   property/method entry text from `properties.txt` / `methods.txt`. Trim only
   redundant Lingo↔JavaScript syntax examples where necessary. No paraphrasing,
   no adding behavior not in the source paragraph (FR-014 — no fabricated
   behavior). Cite option strings/symbols exactly (e.g. `Symbol.for("bitmap")`).
7. **No `import` lines unless a documented property/method actually references
   another Director type** (e.g. `MemberObject` imports `Point`/`Rect`). Avoid
   speculative imports.
8. **Methods return documented default values** when deterministic in v1
   (e.g. `findEmpty() { return 0; }`). Anything not in the docs is a stub per
   FR-014/FR-006, with a `// TODO(subsystems): route through X` comment for the
   tasks phase to wire it.
9. **Builder style** (per `runtime/package/movie.js`): function `xxx(name)`
   returns `new XxxBuilder(name)`; `class XxxBuilder` lives in the same file
   (not exported); per-instance accumulators use `_underscored` names; fluent
   methods return `this`; `.build()` returns a plain `{ … }` object per the
   `…Definition` shape in `data-model.md` and deep-`Object.freeze`s it. Code
   lives in the method body — no factory files, no `applyCommon()` helpers.

## Architecture (per `specs/001-director-runtime/`)

- `src/runtime/context.js` — `DirectorContext extends EventTarget`; owns
  singletons + subsystems + `audioContext` + `canvas` + loop handle +
  `externalParams`; `activate()` writes to worker `globalThis` slots AND
  `runtime/singletons.js` module live-binding slots (research.md R3).
- `src/runtime/subsystems/` — `member-registry.js`, `net-state.js`,
  `window-registry.js`; NO state on classes.
- `src/runtime/objects/` — 13 core `X…Object` + 4 scripting `X…Object` (plain
  docs surface, no statics).
- `src/runtime/objects/media/` — 8 included `X…Member` (JS-native media backends)
  + 11 excluded stubs.
- `src/runtime/methods/` — ~130 top-level Lingo methods (one per file); net ops
  delegate to the `NetState` subsystem; singletons reached via the live-binding
  slots in `runtime/singletons.js`.
- `src/runtime/syntax/` — chunk expressions + `the`-proxy stand-ins.
- `src/runtime/package/` — `movie.js` + `cast.js` builder DSL (pure frozen data).
- `src/runtime/player/` — imperative runtime: `worker-host.js`, `event-loop.js`,
  `canvas.js`, `worker-shim.js`, `cast-loader.js`, `script-lifecycle.js`,
  `mount.js` (`run()`), `custom-elements/`.

## Test Shims

`src/__test-shims__/` installs `Worker`, `OffscreenCanvas` (incl.
`HTMLCanvasElement.prototype.transferControlToOffscreen`), and `AudioContext`
mocks on `globalThis` via `vitest.config.js` `test.setupFiles`. Use them for
player/audio/canvas tests; do NOT re-install in individual test files.

## Out of Scope (per spec)

Lingo→JS translation; binary `.dcr/.dir/.cct/.cst` formats; Score sprite
placement data; MIAW sibling-movie execution. No fabricated behavior beyond the
Director MX 2004 docs.