# director-layer-architecture — Design

## Layer model

```
              PUBLIC                    PRIVATE
   ┌─────────────────────┐   ┌──────────────────────────┐
   │  lingo              │   │  core                    │
   │  browser            │   │  syntax                  │
   └─────────────────────┘   │  runtime                 │
                             └──────────────────────────┘
```

### Locked dependency arrows

```
lingo   ──▶ core
lingo   ──▶ syntax
browser ──▶ core
browser ──▶ runtime
core    ──▶ runtime
syntax  ──▶ core
syntax  ──▶ runtime
```

No upward arrows. `lingo` and `browser` do not import from each other. Enforced by relative import-path review in this change; a lint rule is a follow-up.

## Folder map (state after this refactor)

```
packages/director/src/
  lingo/         public — migrated verbatim from src/api/
                 - *Ref.js? No: only top-level Functions, constants, _globals
                 - index.js re-exports Functions + Constants + _globals
  browser/       public — NEW folder
                 - custom-elements.js (moved from src/runtime/)
                 - index.js (new re-export of custom-elements primitives)
  core/          private — UNCHANGED folder, classes keep current *Ref names
                 - List/PropList/Point/Rect/Color STILL HERE (moved out in follow-up)
                 - KeyRef, MouseRef, SoundRef, SoundChannelRef, PlayerRef,
                   MovieRef, MemberRef, SpriteRef, CastLibraryRef
  syntax/        private — UNCHANGED folder + shape
                 - the-proxy.js, put-into/after/before.js, char/word/item/line.js
                 - Current call shape kept: char(2, "abc") etc.
  runtime/       private — slimmed; custom-elements.js moved out
                 - event-loop.js, script-lifecycle.js, canvas.js, cast-loader.js
                 - (value types still in core/ until follow-up
                    director-runtime-value-types moves them here)
  index.js       re-exports ./lingo/index.js and ./browser/index.js
```

## `package.json` exports (after refactor)

```json
{
  "exports": {
    ".":         "./src/index.js",
    "./lingo":   "./src/lingo/index.js",
    "./browser": "./src/browser/index.js"
  }
}
```

`./api`, `./runtime`, `./syntax` are no longer public. Internal cross-folder imports use relative paths only.

## Import-path rewrites inside moved files

### `src/api/` → `src/lingo/`

Inside each `src/lingo/*.js`:

| Before | After |
|---|---|
| `from "../core/X.js"` | `from "../core/X.js"` (unchanged — core path same depth) |
| `from "../syntax/X.js"` | `from "../syntax/X.js"` (unchanged) |
| `from "../runtime/X.js"` | `from "../runtime/X.js"` (unchanged) |
| `from "./_netRegistry.js"` | `from "./_netRegistry.js"` (unchanged) |

Path depth is identical: `src/api/` and `src/lingo/` are siblings under `src/`. No rewrites needed inside lingo files. `src/lingo/index.js` is unchanged from `src/api/index.js` content.

### `src/runtime/custom-elements.js` → `src/browser/custom-elements.js`

Path depth unchanged (`src/runtime/X.js` and `src/browser/X.js` are siblings). Inside the file:

| Before | After |
|---|---|
| `from "./cast-loader.js"` (if present) | `from "../runtime/cast-loader.js"` |
| `from "../core/X.js"` | unchanged |
| `from "../api/X.js"` (if present) | `from "../lingo/X.js"` |

Case-by-case verify: read `src/runtime/custom-elements.js` and rewrite only the imports that actually cross into other folders.

### `src/runtime/index.js` (slimmed)

Current `src/runtime/index.js` re-exports `registerCustomElements` and `_createMovie` from `custom-elements.js`. After the move:

- `src/runtime/index.js` keeps `startEventLoop`, `stopEventLoop`, `setTempo`, `isEventLoopRunning`, `loadCast`, `dispatchPrepareMovie`, …, `setCanvas`, `getCanvas`, … — everything **except** custom-elements re-exports.
- `src/browser/index.js` (new) re-exports `registerCustomElements`, `_createMovie` from `./custom-elements.js`.

### `src/index.js`

Before:
```js
export * from "./api/index.js";
export * from "./runtime/index.js";
export * from "./syntax/index.js";
```

After:
```js
export * from "./lingo/index.js";
export * from "./browser/index.js";
```

`./core/` is never re-exported publicly. `./runtime/` and `./syntax/` are not re-exported publicly either; they are internal.

## In-repo consumer migration (same commit as refactor)

Search & rewrite:
- `apps/client/src/game/**/index.js` imports of `@project-reborn/director/api` → `@project-reborn/director/lingo`
- `apps/client/src/game/**/index.js` imports of `@project-reborn/director/runtime` → `@project-reborn/director/browser` (only if currently importing custom-elements primitives; otherwise leave)
- `apps/client/src/game/**/index.js` imports of `@project-reborn/director/syntax` → `@project-reborn/director/lingo` (syntax re-exports land in `src/lingo/index.js`)

The translator skill `.agents/skills/linguoscript-to-javascript/SKILL.md` references the old subpaths. Updating the skill is a separate follow-up change so the skill delta is reviewable on its own.

## What this refactor does NOT do

- Rename any class. `MovieRef`, `SpriteRef`, `SoundRef`, `MemberRef`, `CastLibraryRef`, `KeyRef`, `MouseRef`, `PlayerRef`, `SoundChannelRef` keep their names. The `XObject` rename lives in follow-up `director-core-xobjects`.
- Move value types. `src/core/list.js`, `prop-list.js`, `point.js`, `rect.js`, `color.js` stay. Move is follow-up `director-runtime-value-types`.
- Add new constants. `EMPTY`, `VOID`, `TRUE`, `FALSE` keep current values. New constants (`PI`, `RETURN`, `TAB`, `SPACE`, `QUOTE`, `BACKSPACE`, `ENTER`, `INF`, `NAN`) and `KEY_CODES` are follow-up `director-lingo-constants` and `director-core-key-codes`.
- Change chunk call shape. `char(2, "abc")` stays. `char(n).of(str)` migration is follow-up `director-syntax-chunk-of`.
- Add media type subclasses. DVD/3D rejectors, `BitmapMemberObject`, `TextMemberObject`, etc., are follow-up `director-core-media-types`.
- Add `SystemObject`, `WindowObject`, `GlobalObject`. Follow-up `director-core-system-window`.
- Add registration helpers (`defineCast`, `createScriptMember`, etc.). Follow-up `director-browser-registration`.
- Add xtras (`NetLingo`, `XMLParser`). Follow-up `director-core-xtras`.

## Validation

After the refactor:
- `pnpm --filter @project-reborn/director test` passes (existing tests, unchanged content)
- `openspec validate --specs` passes (deltas synced to main specs)
- `openspec validate director-layer-architecture` passes before archive
- `git diff --stat` shows only `rename`/`mv` entries plus `package.json`, `src/index.js`, `src/runtime/index.js`, `src/browser/index.js`, and in-repo consumer import rewrites

## Rationale

Five layers mirror the MX 2004 reference's three concerns (language objects, language syntax, value types) plus two consumer surfaces (Ligo translated code, host browser integration):

- The reference distinguishes Director language constructs (Chapters 5–11) from host integration (Shockwave embedding, cast loading, frame playback). The current `runtime/` conflates both; the current `core/` mixes language objects with value data types; the current `api/`+`syntax/` split is useful internally but exposes two public paths when translated code wants one.
- Keeping class names `*Ref` and value types in `core/` during this refactor holds the diff to mechanical moves only, so tests keep passing and review stays focused on the boundary change. Each semantic improvement lands in its own follow-up change with its own spec delta reflecting the real code it introduces.
- The OpenSpec spec deltas in this change describe the refactor state — not the future state. Follow-up deltas grow the specs as actual code lands.