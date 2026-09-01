# Phase 0 Research: Director Engine Base (002-engine-base)

## Summary

Every architecture-critical decision in the 002 spec resolved cleanly against the
Director MX 2004 scripting reference and the current repository state. The docs
define the data-type surface completely (with three spec-authorized boundary
decisions recorded below); the constants ambiguity flagged in the clarify session
resolves to Lingo character semantics (keyCode columns in constants.txt are the
JS-syntax ALTERNATIVE spelling, not the constant values); and the package breakage
is a mechanical, fully-enumerated import-path repair against the post-refactor
layout — no file moves required. 132 stale test files and the 4 custom shim files
are deleted; vitest/jsdom remains the environment.

---

## R1: Data-type representation (Color, List, PropList, Point, Rect)

**Decision**: All five types keep their own class representation in
`src/engine/types/` (port-with-fixes, see R5). JS natives are reused only for
VALUES inside the types (strings, numbers, booleans — FR-003). Bracket/list-syntax
access on `List`, `PropList`, `Point`, `Rect` is provided by the existing
`Proxy` wrappers, which for `List`/`PropList` must be corrected to doc-defined
semantics (below). `symbol()`/`value()`/`ilk()` are top-level API functions
(methods.txt `ilk()` at 7064; `value()` at 18301) documented as functions of an
object, NOT as members required by the data-type chapter — they stay out of the
002 type surface and are deferred to 006 (documented boundary, contract).

**Rationale** (per type, with doc anchors):

- **Color** — docs: `color()` (methods.txt 2196–2237): "Top level function and
  data type. Returns a Color data object"; three channels `intRed/intGreen/intBlue`,
  "Valid values range from 0 to 255. All other values are truncated" (2217–2224);
  data-type table line 361: "Represents an object's color." No JS native maps a
  color → own class. Members: `red`, `green`, `blue` (read/write, truncated to
  integer 0–255; truncation on construction AND assignment). Single-argument
  `color(intPaletteIndex)` (2199, 2217–2218) is the palette form — palette
  representation is out of 002 scope per spec Key Entities ("no palette behavior
  in scope for 002 beyond what the docs define for construction") and per clarify
  Q1/Q2; the creator function itself is 006-owned.
  Existing implementation: clamping logic correct (`Math.trunc` + 0/255 clamp,
  color.js 9–14, 38–42, 48–75); UNDOCUMENTED members `hex` (81–83), `rgb`
  (89–91), `equals()` (101–119) — removed per clarify Q1 (FR-004).

- **List** — docs: `list()` (methods.txt 8212–8256): "the index of list values
  begins with 1" (8227–8228; note `[]` literals are 0-based per 8234–8235 — not
  our surface). Commands: `add` (semantics: "adds a value to a sorted list at its
  proper position"; unsorted → end — essentials 1699, sort entry 16609–16610),
  `addAt` (223–243), `append` (643–665), `deleteAt` (3155–3186), `deleteOne`
  (3394–3417), `deleteProp` (3419–3447: "for linear lists ... the same as the
  deleteAt command", 3427–3429), `duplicate` (3816–3840 — deep-copies nested
  lists), `getAt` (5193–5253: "If the list contains fewer elements than the
  specified position, a script error occurs", 5200–5201), `getOne` (5824–5854:
  missing → 0, first occurrence, 5833–5834), `getPos` (6057–6079: missing → 0,
  6064–6065), `getLast` (5613–5630), `setAt` (15731–15770: "Director expands the
  list's blank entries", 15740–15742), `sort` (16599–16623 + essentials
  1758–1775: "alphanumeric order, with numbers being sorted before strings"
  essentials 1759; "Strings are sorted according to their initial letters",
  1759–1760), `count` (property — 2498–2536 and essentials 1646–1647, 1653–1661),
  sorted-state persistence (essentials 1764–1765: "will remain sorted, even as
  values are added to or removed from the lists"), reference semantics
  (essentials 1729–1741 — JS objects already behave this way).
  Existing implementation: structure right (class wrapping `Array`); `sorted`
  flag right; `setAt` padding right (fills 0 — filler value is doc-silent, see
  D-2 in the plan); WRONG: `getAt`/bracket reads return `undefined` beyond the
  end (docs → script error); `sort()` comparator uses raw JS `<`/`>` (mixed
  number/string comparisons coerce, violating "numbers before strings", essentials
  1759); `deleteAt` on position ≤ 0 splices from the end (splice(-1,1) deletes the
  last item) — doc behavior for absent position is a Director alert (3162–3164),
  spec Edge Cases authorize no-op; `getLast()` on empty returns `undefined`
  (doc-silent; sentinel decision D-3); `Symbol.iterator` is JS-protocol plumbing,
  kept and itemized in the contract (not a Director member).

- **PropList** — docs: creation (essentials 1491–1518: alternating name/value
  pairs; "Properties can appear more than once in a given property list", 1502);
  commands: `addProp` (methods.txt 479–511: unsorted → end, sorted → proper order,
  duplicate property created when the property already exists — 490–492,
  example 507–511), `deleteAt` (3155), `deleteOne` (3394–3417: deletes value AND
  its property; first occurrence; "Attempting to delete a property has no effect"
  — 3401–3404), `deleteProp` (3419–3447: by name, first only, 3430–3432),
  `duplicate` (3816), `findPos` (4595–4617: "VOID when the specified property is
  not in the list" — 4605–4606; linear-list use → "bogus number"/script error,
  4603–4604), `findPosNear` (4621–4649: "for sorted lists only" 4628–4629; not
  found → "position of the value with the most similar alphanumeric name"
  4636–4639), `getaProp` (5145–5187: "returns VOID when the specified value is
  not in the list" 5161; bracket-access note: missing property via `[]` → script
  error, 5183–5184), `getAt` (5193: beyond count → script error), `getOne`
  (5824–5854: returns the PROPERTY for prop lists, missing → 0, 5831–5834),
  `getPos` (6057: position or 0), `getProp` (6122–6149: error if property absent
  or used on a linear list, 6130–6131), `getPropAt` (6151–6171: property name at
  1-based index; script error if absent, 6158–6160), `setaProp` (15682–15729:
  replaces; "When the property isn't already in the list, Lingo adds the new
  property and value" 15695–15696; script error on linear lists 15693–15694; dot
  operator requires the property to exist, note 15725–15726), `setAt`
  (15731–15742: beyond count → script error for prop lists, 15739–15740), `sort`
  (16599–16623: "sorted alphabetically by properties" 16607–16608), `count`.
  Bracket-SET on a missing property ADDS it (essentials 1562–1567:
  `foodList = [:]; foodList[#Bruno] = "sushi"`).
  Existing implementation: structure right; WRONG: proxy `get` on symbol keys
  returns `getaProp` (missing → `undefined`) — docs: bracket read of missing
  property → script error (5183–5184); string-keyed bracket access
  (`foodList["breakfast"]`, essentials 1611) is not handled (falls through to
  `Reflect.get` → `undefined`); `getaProp`/`findPos` return `undefined` instead
  of VOID (→ `null`, see constants R2); `findPosNear` uses Levenshtein distance
  — over-engineered invention not in the docs (doc semantics: nearest in
  alphanumeric order — decision D-4); `setAt` beyond count silently no-ops (docs:
  script error); `getPropAt`/`getProp` throwing is right (docs say error).

- **Point** — docs: `point()` (methods.txt 12005–12068): "Top level function and
  data type"; "A point has both a locH and a locV property" (12017); coordinates
  are integers (12041–12043). Lingo-only arithmetic documented with explicit JS
  note: "NaN is returned using JavaScript syntax" (12018–12031) → NO operator
  overloading in JS (correctly absent today). List-syntax access (`pt[1]`,
  `pt[2]`) is spec-mandated (US1 scenario 3); the reference shows list syntax
  explicitly only for Rect (methods.txt 14225–14235) but treats point components
  as list elements in operator comparisons (operators.txt 520–522) — spec wins.
  Existing implementation: fields + `[1]`/`[2]` proxy correct. No changes.

- **Rect** — docs: `rect()` (methods.txt 14211–14275): four integer edges
  relative to the Stage (14240–14247); "You can refer to rectangle components by
  list syntax or property syntax" (14225); width is consumer-derived:
  `myRect.right - myRect.left` ≡ `myRect[3] - myRect[1]` (14234–14235). The
  `width`/`height` property entries (properties.txt 9062–9096) apply to
  Image/Member/Sprite, NOT to the Rect data type → no width/height members
  (spec Key Entities agrees: "computed by the consumer from the edges").
  Documented JS arithmetic on rects (14222–14224: `rect + 80` adds to each
  element) is NOT implementable with JS operators (no overloading) — recorded as
  a doc quirk deferred out of 002 (spec requires only property + list syntax).
  Existing implementation: fields + `[1..4]` proxy correct. No changes.

**Alternatives considered**:
- *JS-Array-as-List (no class)*: cannot express 1-based indexing, `count`
  property (not a method), sorted-state, or the command set without polluting
  `Array.prototype`; rejected — docs distinguish List from JavaScript Array
  (essentials 350–353, 1458–1460).
- *Plain objects for Point/Rect (no proxy)*: loses documented list-syntax access
  (`pt[1]`, `myRect[3] - myRect[1]`), which spec scenario 3 requires; rejected.
- *Single generic `DirectorList` base for List+PropList*: docs define two
  distinct types with distinct command sets and cross-type error conventions;
  one class per module (AGENTS.md rule 5) and SOLID S; rejected.
- *Keep Levenshtein `findPosNear`*: invented similarity metric; docs define
  "most similar alphanumeric name" — nearest in sort order (KISS, decision D-4);
  rejected.

---

## R2: Constants resolution (CRITICAL)

**Decision**: The eleven Lingo constants map to JS natives as follows (the
final table is in data-model.md and the contract):

| Constant | Lingo value | JS mapping |
| --- | --- | --- |
| `EMPTY` | `""` (empty string) | `""` |
| `VOID` | VOID (empty value) | `null` (constants.txt JS column: `null`, line 352) |
| `RETURN` | carriage return character | `"\r"` (chr 13) |
| `SPACE` | space character | `" "` (chr 32) |
| `TAB` | tab character | `"\t"` (chr 9) |
| `BACKSPACE` | Backspace key character | `"\b"` (chr 8) — **fix needed** |
| `ENTER` | numeric-keypad Enter character | `"\x03"` (chr 3) — already correct |
| `QUOTE` | quotation mark character | `'"'` (chr 34) |
| `TRUE` | logically TRUE (traditional numeric 1) | `true` |
| `FALSE` | logically FALSE (numerical value 0) | `false` |
| `PI` | π | `Math.PI` (constants.txt JS column: `Math.PI`, line 165) |

**Rationale**: constants.txt describes each key constant as a CHARACTER constant
compared against `_key.key` in every example (`if (_key.key = BACKSPACE)` line 61,
`= ENTER` line 118, `= RETURN` lines 234/1079, `= TAB` lines 289/298). The `key`
property returns "the ANSI value that is assigned to the key, not the numerical
value" (properties.txt `key` entry, 10242 → quoted in key.js 34–49); `keyCode`
returns "the key's numerical value, not the ANSI value" (properties.txt 10335).
Therefore Lingo constant values are ANSI characters: BACKSPACE = chr(8),
RETURN = chr(13) (the JS column itself shows `\n // when used in a string`,
constants.txt 225 — its string form), SPACE = chr(32), TAB = chr(9) (its example
explicitly says "checks whether the character typed is the tab character", line
286–289), ENTER = chr(3) ("On PC keyboards, the element ENTER refers only to
Enter on the numeric keypad", 108–109). TRUE/FALSE map to JS booleans with the
documented numeric coercions (346–344 / 135–157: FALSE is 0; any nonzero integer
evaluates to TRUE); VOID maps to `null` per the JS column; PI to `Math.PI`.

**Doc discrepancy (recorded in the plan)**: the JavaScript column of each key
constant entry lists a keyCode — `BACKSPACE`→51, `ENTER`→3, `RETURN`→36,
`SPACE`→49, `TAB`→48 (constants.txt 50, 104, 224, 258, 279) as the JS-syntax
ALTERNATIVE for `_key.keyCode` comparisons in the JS examples — they are NOT the
Lingo constant values. Evidence: the JS examples all write `if (_key.keyCode ==
51)` etc. (lines 68, 123, 237, 292, 307) while the Lingo examples write
`if (_key.key = BACKSPACE)`. The current implementation mirrors the keyCodes:
`BACKSPACE = String.fromCharCode(51)` → `"3"` (WRONG — chr(8) correct);
`ENTER = String.fromCharCode(3)` (coincidentally CORRECT — the numpad-Enter
character IS chr(3), and its keyCode is also 3). `RETURN="\r"`, `SPACE=" "`,
`TAB="\t"`, `QUOTE='"'`, `EMPTY=""`, `VOID=null`, `TRUE=true`, `FALSE=false`,
`PI=Math.PI` are all already correct (constants.js). Only BACKSPACE changes.

**Alternatives considered**:
- *Keep keyCode-mirrored values (`"3"`/`"\x03"`)*: contradicts the character
  semantics; `_key.key = BACKSPACE` comparisons (the documented use) would never
  match; rejected.
- *Map VOID to `undefined`*: the docs' JS column explicitly maps VOID to `null`
  (line 352); rejected.
- *TRUE/FALSE as numbers 1/0*: the JS column maps them to `true`/`false` (141,
  328); the numeric semantics are honored by JS boolean coercion and documented
  in the contract; rejected.

---

## R3: Package stabilization scope

**Decision**: Keep the CURRENT post-refactor layout as final and repair imports
in place — no file moves, no rearrange-to-final-layout pass (the refactor already
established the target: `src/engine/{objects,types}`, `src/runtime/{package,
subsystems,player,syntax,context,singletons,constants,index}`, `src/lingo/{index,
methods}`, `src/browser/index.js`, `src/index.js`). Later specs build on this
layout. Verified broken imports (node resolver over all 42 broken source files):

| File | Broken path(s) | Correct fix |
| --- | --- | --- |
| `src/lingo/index.js` | 107 × `../runtime/methods/<X>.js` | `../lingo/methods/<X>.js` (all 107 target files exist — verified) |
| `src/browser/index.js` | `../runtime/creators/movie.js`, `../runtime/creators/cast.js`, `../runtime/creators/define-movie.js`, `../runtime/creators/define-cast.js` | `../runtime/package/movie.js`, `../runtime/package/cast.js`; **remove** the `defineMovie`/`defineCast` exports — their targets were deliberately deleted by the 001 refactor (refactor.md 211–212, 217, 227 "defineMovie is NOT rebuilt") |
| `src/runtime/index.js` | 13 × `./objects/*.js`, 5 × `./types/*.js` | `../engine/objects/*.js`, `../engine/types/*.js` (`./constants.js`, `./singletons.js`, `./context.js` already resolve) |
| `src/runtime/context.js` | 7 × `./objects/*.js` | `../engine/objects/*.js` |
| `src/runtime/singletons.js` | 7 × `./objects/*.js` | `../engine/objects/*.js` |
| `src/runtime/player/cast-loader.js` | `../objects/cast-library.js` | `../../engine/objects/cast-library.js` |
| `src/runtime/syntax/the-proxy.js` | `../objects/cast-library.js` | `../../engine/objects/cast-library.js` |
| `src/lingo/methods/alert.js`, `appMinimize.js`, `beep.js`, `beginRecording.js`, `breakLoop.js`, `callFrame.js`, `castLib.js`, `cursor.js`, `delay.js`, `externalParamName.js`, `externalParamValue.js`, `flushInputEvents.js`, `go.js`, `goLoop.js`, `goNext.js`, `goPrevious.js`, `halt.js`, `idleLoadDone.js`, `insertFrame.js`, `marker.js`, `quit.js`, `sound.js`, `sprite.js`, `stopEvent.js` | `../singletons.js` | `../../runtime/singletons.js` |
| `src/lingo/methods/color.js`, `flashToStage.js`, `list.js`, `listP.js`, `makeSubList.js`, `max.js`, `min.js`, `point.js`, `propList.js`, `rect.js` | `../types/<X>.js` | `../../engine/types/<X>.js` |
| `src/lingo/methods/ilk.js` | 5 × `../types/*.js`, 7 × `../objects/*.js` (incl. `../objects/index.js`) | `../../engine/types/*.js`, `../../engine/objects/*.js` |

(35 method files carry broken imports — verified by resolver; the task brief said
45, the verified count is 35 plus `lingo/index.js` itself. 132 test files also
carry broken imports but are deleted, not fixed.)

Also verified: `src/engine/objects/index.js` already re-exports the 13 objects
AND the 5 types (lines 15–19) — correct as-is; `src/runtime/syntax/index.js`
exports everything `@/lingo` expects (verified 1:1); `export * from
"../runtime/constants.js"` and `../runtime/syntax/index.js` in `lingo/index.js`
already resolve. `package.json` exports map is already correct (`.` →
`src/index.js`, `./lingo` → `src/lingo/index.js`, `./browser` →
`src/browser/index.js`) — NO package.json change. Zero runtime dependencies —
correct. External consumer: `apps/client/package.json` declares
`"@project-reborn/director": "workspace:*"` but has no source imports yet
(verified) — unaffected.

Cleanup mechanics: FULLY delete `src/__test-shims__/` (4 files) — all 9
`__tests__` directories (132 `*.test.js` files, verified: `src/__tests__` 1,
`src/engine/types/__tests__` 5, `src/lingo/methods/__tests__` 106,
`src/runtime/__tests__` 3, `src/runtime/package/__tests__` 1,
`src/runtime/player/__tests__` 4, `src/runtime/player/custom-elements/__tests__`
1, `src/runtime/subsystems/__tests__` 3, `src/runtime/syntax/__tests__` 8).
`vitest.config.js` drops `setupFiles: ["./src/__test-shims__/index.js"]`
(environment stays `"jsdom"`, include stays `src/**/__tests__/**/*.test.js`).
Recommended (plan decision, unreferenced dead code — zero importers verified):
delete `src/engine/packaging/` (2 stub files returning `{}`) and
`packages/director/architecture/` (4 scaffold files) — neither appears in the
target layout; nothing imports them.

**Rationale**: 001's spec named `runtime/objects` with `X…Object` naming and the
`@/lingo` barrel; the post-refactor layout moved internals to `engine/` while
keeping every PUBLIC name stable (001's own lingo-public-api.md lists only names,
not paths). The 002 spec supersedes 001 where conflicting (spec line 149); the
internal layout is a private implementation detail, so the fix is purely
mechanical path repair. Moving files again would churn every engine import,
contradict the "only FIX the broken imports" direction, and add risk for zero
consumer benefit.

**Alternatives considered**:
- *Rearrange to a cleaned final layout now (e.g. move constants into
  engine/)*: not required by the spec; the layout is already coherent and later
  specs build on it; rejected (KISS).
- *Delete `src/runtime/index.js` (zero importers)*: the task explicitly
  instructs fixing it; it is the canonical internal barrel for later specs;
  fix-in-place, keep.
- *Recreate `define-movie.js`/`define-cast.js` as stubs*: refactor.md
  deliberately deleted them and specifies `run()` as the ingest path; stubbing
  would extend scope; rejected — remove the two dangling exports.

---

## R4: Testing strategy

**Decision**: `vitest` with `environment: "jsdom"` (already configured,
vitest.config.js line 5), NO `setupFiles` (remove the shim reference), no
package-local shims anywhere. All 002-scope tests are pure unit tests (no DOM
needed; jsdom is harmless and satisfies the spec's "standard DOM environment"
requirement — FR-010). New test files (7): `src/engine/types/__tests__/`
{`color`, `list`, `prop-list`, `point`, `rect`}`.test.js`,
`src/runtime/__tests__/constants.test.js`, and
`src/__tests__/entry-points.test.js` (fresh-process imports of all three public
entries + surface assertions — regression for FR-007/FR-008/SC-004/SC-007; the
old `public-barrels.test.js` is deleted with the 132 and its coverage re-expressed
fresh per FR-009). Surface audit checks (quickstart scenario 2): prototype
member scan via `Object.getOwnPropertyNames(ctor.prototype)` against the
documented member list, plus own-field checks against the contract's field
tables (which itemize implementation storage fields — see D-1).

Red-green flow (FR-010): (1) Phase 0 — delete shims + all 132 tests, fix
`vitest.config.js`; (2) write the 7 new test files; (3) run `pnpm --filter
@project-reborn/director test` → observe red (module-resolution failures on the
broken imports, plus real behavior failures: `hex`/`rgb`/`equals` still present,
BACKSPACE wrong, sort coercion, missing-sentinel mismatches); (4) apply the
import repairs + type/constant fixes; (5) green with no pre-existing failures
(the 132 are gone, so "no pre-existing failures" is trivially satisfiable and
meaningful — the suite contains only in-scope tests).

**Rationale**: matches the spec's mandate (FR-010, US4), the package's existing
vitest+jsdom convention, and the constitution's Test & Verification Discipline
(pnpm filter gate). Pure-unit scope means no worker/audio/canvas mocking is
needed at all in 002 — the deleted shims are simply not recreated.

**Alternatives considered**: happy-dom instead of jsdom — allowed by the spec
but jsdom is already configured; no reason to churn (KISS). Keeping the shims —
explicitly forbidden by the clarify session (spec line 17).

---

## R5: Port-vs-rewrite decision summary

- **Color**: port-with-fixes — clamping logic correct; remove undocumented
  `hex`/`rgb`/`equals()` (+ `toHex2` helper) per clarify Q1.
- **List**: port-with-fixes — typed sort comparator ("numbers before strings"),
  `getAt`/bracket reads throw beyond range, `deleteAt` no-op out-of-range,
  `getLast()` empty → VOID, keep proxies + `items`/`sorted` fields.
- **PropList**: port-with-fixes — proxy semantics corrected (string- and
  symbol-keyed bracket reads with missing → script error; bracket-set adds),
  `findPos`/`getaProp` missing → VOID (`null`), `setAt` beyond count throws,
  `findPosNear` = nearest by alphanumeric order (drop Levenshtein), keep
  duplicate-`addProp` behavior.
- **Point**: port — no changes (fields + `[1]`/`[2]` proxy already doc/spec
  conformant).
- **Rect**: port — no changes (fields + `[1..4]` proxy; width/height correctly
  absent).
- **Constants module**: port-with-one-fix — only `BACKSPACE` changes to chr(8);
  all other ten values verified correct.
- **Barrels/entries (`lingo/index.js`, `browser/index.js`, `runtime/index.js`,
  `runtime/context.js`, `runtime/singletons.js`, `cast-loader.js`,
  `the-proxy.js`, 35 `lingo/methods/*.js`)**: minimal import-path repair — no
  rewrite, no file moves; plus removal of the 5 creator exports from
  `@/lingo` (deferred to 006, documented in contract) and the 2 dangling
  `defineMovie`/`defineCast` browser exports.

## Consolidation

All Technical Context questions from the 002 clarify session are resolved (no
needs-clarification remain): constants → Lingo character semantics; Color
undocumented members → removed; shims → deleted; `rgb()` → absent (deferred to
006). Plan-level decisions (D-1 … D-4) recorded for the three doc-silent
points authorized by the spec's Edge Cases. Design proceeds to Phase 1.