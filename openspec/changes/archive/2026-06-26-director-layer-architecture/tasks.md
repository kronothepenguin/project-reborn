# director-layer-architecture — Tasks

## 1. Scaffold

- [x] 1.1 `openspec new change director-layer-architecture --description "..."`
- [x] 1.2 Write `proposal.md`
- [x] 1.3 Write `design.md`
- [x] 1.4 Write `tasks.md`

## 2. Spec deltas (refactor state only — describe what the refactor actually does, not future states)

- [x] 2.1 Write `specs/director-core/spec.md` (MODIFIED): private language-object layer; value types still here until follow-up; `Symbol`/`String` declared native; still private.
- [x] 2.2 Write `specs/director-lingo/spec.md` (MODIFIED): `src/api/` renamed to `src/lingo/`; public export `./lingo`; constants char-form only for the existing four; re-exports `director-syntax` constructs; `./api` and `./syntax` removed from public exports.
- [x] 2.3 Write `specs/director-runtime/spec.md` (MODIFIED): `custom-elements.js` moved out to `browser/`; `./runtime` removed from public exports; holds event-loop/canvas/script-lifecycle/cast-loader-fetch (high-level); value types still in `core/` until follow-up.
- [x] 2.4 Write `specs/director-syntax/spec.md` (ADDED): new capability. Source `src/syntax/` (existing). Private. Holds `the`-proxy + chunk/`put` constructs. Current chunk call shape (`char(2, "abc")`) described as-is; `.of()` migration deferred to follow-up. Re-exported via `./lingo`.
- [x] 2.5 Write `specs/director-browser/spec.md` (ADDED): new capability. Source `src/browser/` (new). Public. Holds `custom-elements.js` migrated from `runtime/`. Registration helpers (`defineCast`, `createScriptMember`, etc.) deferred to follow-up `director-browser-registration`.

## 3. Validate

- [x] 3.1 `openspec validate director-layer-architecture`
- [x] 3.2 `openspec validate --specs`

## 4. Review

- [x] 4.1 User reviews deltas
- [x] 4.2 Corrections applied (still inside the change proposal)

## 5. Archive

- [x] 5.1 `openspec archive director-layer-architecture` — syncs deltas into main specs

## 6. Mechanical refactor commit

- [x] 6.1 Verify `packages/director/src/api/__tests__/` test list and `src/runtime/__tests__/custom-elements.test.js` presence
- [x] 6.2 `git mv packages/director/src/api packages/director/src/lingo`
- [x] 6.3 `mkdir packages/director/src/browser` and `git mv packages/director/src/runtime/custom-elements.js packages/director/src/browser/custom-elements.js`
- [x] 6.4 `git mv` the matching test file if present
- [x] 6.5 Rewrite `src/lingo/index.js` to re-export syntax constructs (so `./lingo` is the single public path for translated code): add `export { the, char, word, item, line, putInto, putAfter, putBefore } from "../syntax/index.js"`
- [x] 6.6 Slim `src/runtime/index.js`: remove `registerCustomElements` / `_createMovie` re-exports
- [x] 6.7 Create `src/browser/index.js`: re-export `registerCustomElements`, `_createMovie` from `./custom-elements.js`
- [x] 6.8 Rewrite `src/index.js`: `export * from "./lingo/index.js"; export * from "./browser/index.js";`
- [x] 6.9 Update `packages/director/package.json` `exports` to only `.`, `./lingo`, `./browser`
- [x] 6.10 Rewrite internal relative imports inside `src/browser/custom-elements.js` that cross into other folders
- [x] 6.11 Rewrite in-repo consumer imports:
  - `apps/client/src/game/**/index.js` `@project-reborn/director/api` → `@project-reborn/director/lingo`
  - `apps/client/src/game/**/index.js` `@project-reborn/director/syntax` → `@project-reborn/director/lingo`
  - any `apps/client/src/director/**` `@project-reborn/director/runtime` → `@project-reborn/director/browser` (only for custom-elements consumers; otherwise leave)
- [x] 6.12 Run `pnpm --filter @project-reborn/director test` and `pnpm --filter @project-reborn/client-r26 test` (or `pnpm -r test` if simpler)
- [x] 6.13 `git diff --stat` review — no file content changes other than `package.json`, `src/index.js`, `src/runtime/index.js`, `src/browser/index.js`, `src/lingo/index.js`, `src/browser/custom-elements.js` (import rewrites), and in-repo consumer import rewrites

## 7. Follow-up pointers (separate OpenSpec changes, user-directed)

- [ ] 7.1 `director-runtime-value-types` — move `List`/`PropList`/`Point`/`Rect`/`Color` from `core/` to `runtime/`
- [ ] 7.2 `director-core-xobjects` — rename existing `*Ref` classes per naming rule (XObject for documented objects, XRef only for documented "reference to")
- [ ] 7.3 `director-core-system-window` — add `SystemObject`, `WindowObject`, `GlobalObject`
- [ ] 7.4 `director-core-media-types` — media type subclass hierarchy + DVD/3D rejectors
- [ ] 7.5 `director-core-key-codes` — add `KEY_CODES` map to `core/`
- [ ] 7.6 `director-lingo-constants` — add `PI`, `RETURN`, `TAB`, `SPACE`, `QUOTE`, `BACKSPACE`, `ENTER`, `INF`, `NAN` char-form constants to `lingo/`
- [ ] 7.7 `director-syntax-chunk-of` — migrate chunk helpers to `char(n).of(str)` / `.to(m).of(str)` chainable shape
- [ ] 7.8 `director-browser-registration` — add `defineCast`, `createScriptMember`, `createFieldMember`, `createImageMember`
- [ ] 7.9 `director-core-xtras` — add `NetLingoObject`, `XMLParserObject`
- [ ] 7.10 Translator skill `@.agents/skills/linguoscript-to-javascript/SKILL.md` import-path migration (separate doc/skill change)

Each follow-up is its own `openspec new change`, its own proposal + design + tasks + delta spec scoped to ONE piece, implemented only after user approval, and updates the relevant existing spec to reflect what it actually introduces.