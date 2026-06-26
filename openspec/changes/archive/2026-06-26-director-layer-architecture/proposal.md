# director-layer-architecture

## Why

`packages/director/src/` currently has four folders whose boundaries drifted from documented intent:

- `src/api/` and `src/syntax/` together form the Ligo consumer surface, but they expose two public import paths (`./api`, `./syntax`) when translated code wants a single path.
- `src/core/` mixes Director language objects (`MovieRef`, `SpriteRef`, `SoundRef`, …) with Director value data types (`List`, `PropList`, `Point`, `Rect`, `Color`). The MX 2004 reference keeps these separate (Ch 5 core objects vs the data-types section of Ch 2).
- `src/runtime/` mixes host-mount helpers (`custom-elements.js`, `_createMovie`) with low-level host-API wrappers (`canvas.js`, `event-loop.js`, `script-lifecycle.js`, `cast-loader.js`).

This refactor lands a five-layer architecture matching the reference's separation and locks the public/private boundary. It is mechanical: folder moves, `package.json` exports trim, and internal relative import rewrites. Zero new behaviour. Zero class renames. Zero new code.

Follow-up changes (one per object/piece, user-directed) will update the existing specs to reflect each new class, constant, API, or shape they introduce. This change alone updates the specs to reflect only what the refactor actually does.

## What Changes

- Formalise five layers under `packages/director/src/`:
  - Public: `lingo`, `browser`
  - Private: `core`, `syntax`, `runtime`
- Lock dependency arrows (enforced by import-path review, not by lint yet):
  ```
  lingo   ──▶ core, syntax
  browser ──▶ core, runtime
  core    ──▶ runtime
  syntax  ──▶ core, runtime
  ```
  No upward arrows. `lingo` and `browser` do not import from each other.
- Mechanical moves (no logic change inside moved files):
  - `src/api/` → `src/lingo/` (all method files + tests + index)
  - `src/runtime/custom-elements.js` → `src/browser/custom-elements.js` (+ test if present)
  - `src/runtime/index.js` re-export of `registerCustomElements` / `_createMovie` removed; those names move to `src/browser/index.js`
- `packages/director/package.json` `exports` trimmed to:
  ```json
  {
    "exports": {
      ".":         "./src/index.js",
      "./lingo":   "./src/lingo/index.js",
      "./browser": "./src/browser/index.js"
    }
  }
  ```
  `./api`, `./runtime`, `./syntax` removed from public exports.
- `src/index.js` re-exports only `./lingo/index.js` and `./browser/index.js`.
- Internal relative imports inside moved files rewritten to point at `../core/`, `../runtime/`, `../syntax/` as appropriate.
- Existing classes keep their current names. `XObject` rename, new `SystemObject` / `WindowObject` / `GlobalObject`, `KEY_CODES`, media type hierarchy, DVD/3D rejectors — all deferred to follow-up changes.
- Existing chunk helpers (`char`, `word`, `item`, `line`) keep their current call shape. `char(n).of(str)` migration is a follow-up change.
- Existing constants set (`EMPTY`, `VOID`, `TRUE`, `FALSE`) keeps current values. New constants (`PI`, `RETURN`, `TAB`, `SPACE`, `QUOTE`, `BACKSPACE`, `ENTER`, `INF`, `NAN`) and `KEY_CODES` are follow-up changes.

## Capabilities

### New Capabilities
- `director-syntax`: private layer holding `the`-proxy and chunk/`put` constructs; already exists at `src/syntax/`; now formally spec'd as a private layer re-exported by `./lingo`.
- `director-browser`: public host-integration layer; custom elements migrated here from `runtime/`; registration helpers (future) live here.

### Modified Capabilities
- `director-core`: reframed as private Director language-object layer. Value data types move out. `Symbol` / `String` declared native (no wrapper). Still private.
- `director-lingo`: reframed as public top-level consumer surface. Source folder renamed from `src/api/` to `src/lingo/`. Constants and syntax constructs re-exported here. `./api` and `./syntax` public exports removed.
- `director-runtime`: reframed as private low-level host-integration layer. Gains value types from `core/`. Loses `custom-elements.js` to `browser/`. `./runtime` public export removed.

## Impact

- **Code**: `packages/director/src/` reorganised mechanically. All current `src/api/*` method files preserved verbatim (only path moves). `src/runtime/custom-elements.js` moves verbatim. Internal relative imports inside moved files are rewritten. No implementation deleted.
- **Tests**: existing tests under `src/api/__tests__/`, `src/runtime/__tests__/`, `src/syntax/__tests__/`, `src/core/__tests__/` keep their assertions. Test file paths move with their sources. No new tests in this change.
- **Dependencies**: no new runtime deps. `package.json` `exports` map updated.
- **Consumers**: existing imports from `@project-reborn/director/api`, `@project-reborn/director/syntax`, `@project-reborn/director/runtime` in `apps/client/` and in the `linguoscript-to-javascript` skill must migrate import paths to `@project-reborn/director/lingo` (and later `./browser` for mount code). Migrating consumers is out of scope for this change; consumers continue to work only if the old subpaths are temporarily kept OR the consumer is migrated in the same commit. Decision: keep this change self-contained by updating in-repo consumers in the refactor commit — `apps/client/src/game/**/*/index.js` and any `apps/client/src/director/**` mount code that imports the old subpaths. The translator skill `.md` is updated in a separate follow-up change.

## Out of Scope

- Any new code. No `XObject` rename, no `SystemObject` / `WindowObject` / `GlobalObject`, no `KEY_CODES`, no media type hierarchy, no DVD/3D rejectors, no new constants, no `char(n).of(str)` shape migration, no NetLingo / XMLParser xtras, no `defineCast`/`createScriptMember` registration helpers.
- Each of the above is a separate OpenSpec change, user-directed, one piece at a time, with its own proposal + design + tasks + delta spec that updates the relevant existing spec to reflect what that follow-up actually introduces.

## Components Moved

| From | To | Notes |
|---|---|---|
| `src/api/*.js`, `src/api/__tests__/`, `src/api/index.js` | `src/lingo/*.js`, `src/lingo/__tests__/`, `src/lingo/index.js` | `git mv`; internal imports rewritten |
| `src/runtime/custom-elements.js`, `src/runtime/__tests__/custom-elements.test.js` | `src/browser/custom-elements.js`, `src/browser/__tests__/custom-elements.test.js` | `git mv`; internal imports rewritten |
| `src/runtime/index.js` (re-export of custom-elements primitives) | `src/browser/index.js` (new) | Re-export moved; `src/runtime/index.js` slimmed |
| `src/index.js` | `src/index.js` | Rewritten to re-export `./lingo/index.js` and `./browser/index.js` |
| `packages/director/package.json` `exports` | same file | Trim to `./lingo`, `./browser`, `.` |

## Components NOT Moved / Renamed (deferred)

| Component | Reason |
|---|---|
| `src/core/*Ref.js` classes | Renamed to `XObject` in follow-up `director-core-xobjects`. |
| `src/core/list.js`, `prop-list.js`, `point.js`, `rect.js`, `color.js` | Moved to `src/runtime/` in follow-up `director-runtime-value-types`. |
| `src/syntax/char.js` etc. call shape | Migrated to `char(n).of(str)` in follow-up `director-syntax-chunk-of`. |
| `src/api/index.js` constants (`EMPTY`, `VOID`, `TRUE`, `FALSE`) | Extended with `PI`, `RETURN`, `TAB`, `SPACE`, `QUOTE`, `BACKSPACE`, `ENTER`, `INF`, `NAN` in follow-up `director-lingo-constants`. |
| `src/runtime/cast-loader.js` | Stays in `runtime/` (low-level fetch). Registration helpers (`defineCast`, `createScriptMember`, …) added in follow-up `director-browser-registration` to `src/browser/`. |
| `src/runtime/event-loop.js`, `canvas.js`, `script-lifecycle.js`, `cast-loader.js` | Stay in `runtime/`. |
| DVD/3D rejectors, NetLingo, XMLParser | Follow-ups `director-core-media-types`, `director-core-xtras`. |