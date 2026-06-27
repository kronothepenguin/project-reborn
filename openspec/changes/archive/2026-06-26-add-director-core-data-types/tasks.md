## 1. Spec corrections (director-core)

- [x] 1.1 In `openspec/specs/director-core/spec.md`, replace the "director-core SHALL treat Director value data types as a separate concern (transition state)" requirement (remove it) per the delta's REMOVED block
- [x] 1.2 Update the "director-core SHALL implement Director data structures" requirement to declare permanent ownership of `List`, `PropList`, `Point`, `Rect`, `Color` in `src/core/` and add the PropList and Color scenarios plus the "Value data types stay in core" scenario
- [x] 1.3 Broaden the "director-core SHALL treat Symbol and String as native JavaScript" requirement to cover all native JS-mapped types (`Array`, `Boolean`, `Constant`, `Date`, `Float`, `Function`, `Integer`, `Object`, `String`, `Symbol`) with the added "No wrapper for other native data types" scenario
- [x] 1.4 Add the new "director-core SHALL codify the Director data-type set" requirement and the new "director-core SHALL NOT implement Director 3D Vector" requirement

## 2. Spec corrections (director-runtime)

- [x] 2.1 Remove the "director-runtime SHALL host Director value data types after the follow-up move (transition state)" requirement and its scenarios per the delta's REMOVED block
- [x] 2.2 Modify the "director-runtime SHALL be the private low-level host-integration layer" requirement: drop the `director-runtime-value-types` follow-up reference, add the "SHALL NOT host Director value data types" sentence and the "Value data types are not in runtime" scenario

## 3. Implementation gap closure (src/core/)

- [x] 3.1 Audit `packages/director/src/core/{list,prop-list,point,rect,color}.js` against the codified data-type contract; record gaps
  - `list.js`: coverage of Director list operations (`add`, `addAt`, `deleteAt`, `getAt`, `count`, `sort`, `duplicate`, `getLast`, `setAt`, `append`, `deleteOne`, `getOne`, `getPos`) is adequate; no gaps for the codified contract.
  - `prop-list.js`: coverage of Director property-list operations (`addProp`, `setaProp`, `getaProp`, `getPropAt`, `deleteProp`, `count`, `getProp`, `getAt`, `setAt`, `findPos`, `findPosNear`, `sort`, `duplicate`) is adequate; order preserved.
  - `point.js`: `locH`/`locV` cover the codified Point surface; no gaps.
  - `rect.js`: `left`/`top`/`right`/`bottom` present, but `width` and `height` derived accessors are missing — needed for the "Point and Rect model coordinates" scenario.
  - `color.js`: only `red`/`green`/`blue`; missing hex/RGB accessors and equality — must be filled per the "Color models a Director color value" scenario.
  - No `Vector` / 3D type present in `src/core/`.
- [x] 3.2 Extend `color.js` with the documented Color surface (hex/rgb accessors, equality, factory `color()` proxy parity) to satisfy the "Color models a Director color value" scenario
- [x] 3.3 Fill any other surfaced gaps in `list.js`, `prop-list.js`, `point.js`, `rect.js` without changing existing public method names/signatures
- [x] 3.4 Ensure no `Vector` class or 3D vector type is present anywhere in `packages/director/src/core/`

## 4. Tests

- [x] 4.1 Add/extend `packages/director/src/core/__tests__/color.test.js` covering the new Color accessors and equality
- [x] 4.2 Add a test asserting the value-type files live under `src/core/` and are absent from `src/runtime/` (guards against the cancelled move)
- [x] 4.3 Add a test asserting `director-core` exposes no `Vector` type
- [x] 4.4 Run `pnpm --filter @project-reborn/director test` (vitest) and ensure the director-core suite passes
  - Added `vitest run` test script + `vitest` devDependency to `packages/director/package.json` (was previously a broken `echo ... exit 1` placeholder).
  - `director-core` suite: **520/520 tests pass** (12 files: `list`, `color` (extended), `prop-list`, `point`, `rect`, `cast-library-ref`, `member-ref`, `movie-ref`, `player-ref`, `sound-ref`, `sprite-ref`, `data-types-contract` (new)).
  - Pre-existing failures in `src/lingo/__tests__/*` and `src/browser/__tests__/custom-elements.test.js` (need `vi` global + `jsdom` env) are not caused by this change — they were dormant because no test script was wired. Out of scope for this change.

## 5. Validation

- [x] 5.1 Run `openspec validate add-director-core-data-types` (or equivalent) to confirm spec deltas are well-formed
  - `openspec validate add-director-core-data-types` → "Change 'add-director-core-data-types' is valid"
- [x] 5.2 Run `pnpm --filter @project-reborn/director build` and lint/typecheck to confirm no regressions
  - `director` has no `build` step (pure ESM library consumed by `apps/client` vite build). Syntactic check via `node --check` across all 270 source files: all pass.
  - Touched modules (`color.js`, `rect.js`) re-tested under vitest: `color.test.js` 40/40, `rect.test.js` 38/38 pass.
  - No linter / TypeScript configured in the workspace; nothing to lint or typecheck.
- [x] 5.3 Confirm consumers (`director-lingo`, `director-syntax`, `director-browser`) still import value types from `../core/...` with no path changes
  - 5 consumer imports of value types remain under `../core/`:
    - `src/lingo/min.js:1` → `../core/list.js`
    - `src/lingo/max.js:1` → `../core/list.js`
    - `src/lingo/ilk.js:2-4` → `../core/color.js`, `../core/point.js`, `../core/rect.js`
  - 0 consumer imports of value types under `../runtime/` (none before, none after).
  - `director-syntax` and `director-browser` do not currently import value types directly.