# Contract: `@/lingo` Library Entry — 002 Scope

The `@project-reborn/director/lingo` subpath exports the Lingo public surface.
This contract defines the 002 export set, the 002→006 data-type boundary, and
the JSDoc convention that makes the member surface auditable (FR-004/SC-001).

## 002 export set from `@/lingo` (src/lingo/index.js)

| Category | Exports | Source module |
| --- | --- | --- |
| Singletons | `_movie`, `_player`, `_sound`, `_key`, `_mouse`, `_system`, `_global` | `../runtime/singletons.js` (unchanged) |
| Constants | `EMPTY`, `VOID`, `RETURN`, `SPACE`, `TAB`, `BACKSPACE`, `ENTER`, `QUOTE`, `TRUE`, `FALSE`, `PI` (11) | `../runtime/constants.js` (unchanged path; BACKSPACE value fixed) |
| Data-type classes | `Color`, `List`, `PropList`, `Point`, `Rect` (5) | `../engine/types/{color,list,prop-list,point,rect}.js` (NEW exports in 002) |
| Syntax stand-ins | `char`, `charRange`, `item`, `itemRange`, `line`, `lineRange`, `word`, `wordRange`, `the`, `putInto`, `putBefore`, `putAfter` | `../runtime/syntax/index.js` (unchanged) |
| Top-level methods | all 107 documented method names EXCEPT the 5 creators (102) | `../lingo/methods/*.js` (import paths fixed; 006 owns behavior) |

## Removed from the 002 barrel (documented boundary)

| Name | Reason |
| --- | --- |
| `color()`, `list()`, `point()`, `propList()`, `rect()` | Top-level creator FUNCTIONS are API surface owned by feature 006 (spec: "later specs will cover … the public API"). The 002 data-type CLASSES are exported (FR-001 consumers need them); the creator modules remain on disk with fixed imports (`src/lingo/methods/{color,list,point,propList,rect}.js`), dormant until 006 defines and wires them. The engine-level factory functions in `src/engine/types/*.js` remain internal (used by the dormant modules and future specs). |
| `symbol()`, `value()`, `ilk()` (relationship to types) | Top-level API functions (`ilk()` methods.txt 7064, `value()` 18301); the data-type chapter does not require them as type members — deferred to 006; still exported from `@/lingo` as methods (unchanged). |
| `rgb()` | No methods.txt/properties.txt entry (only 3D examples); must NOT exist in 002 (clarify Q2) — no module, no export. |

`src/browser/index.js` additionally drops `defineMovie`/`defineCast`
(their modules were deleted by the 001 refactor, refactor.md 211–227); its
remaining exports (`createContext`, `destroyContext`, `resetSingletons`,
`registerCustomElements`, `_createMovie`, `movie`, `cast`) are unchanged.

## Member-surface contract per class (audit source of truth)

The exact member lists are in [../data-model.md](../data-model.md). Audit rule
(quickstart scenario 2): `Object.getOwnPropertyNames(ctor.prototype)` minus
`constructor` must equal the documented method/accessor set; own-property names
must be within (documented fields ∪ itemized implementation fields). Implementation
fields (D-1): `List.items`, `List.sorted`, `PropList.entries`, `PropList.sorted`,
`Color._red/_green/_blue`. `Symbol.iterator` on List/PropList is JS-protocol
plumbing (not a Director member) and is listed here as a known, allowed
non-documented prototype entry. Undocumented surface REMOVED in 002: `Color.hex`,
`Color.rgb`, `Color.equals`.

## JSDoc convention (contract constraint)

Every documented member carries one `/** … */` block quoted VERBATIM from
`docs/drmx2004_scripting_ref/` (methods.txt / properties.txt / essentials
chapter text), trimming only redundant Lingo↔JavaScript syntax examples
(package AGENTS.md rule 6; FR-014). No paraphrasing, no added behavior. The
002 data-type classes already follow this; edits (Color member removal, List/
PropList fixes) preserve verbatim quoting of the remaining members.

## Testability

- All five classes and eleven constants importable from `@/lingo` with no
  activated context and no import-time side effects (FR-007).
- Constants values assert the doc strings (e.g. `BACKSPACE === "\b"`,
  `RETURN === "\r"`, `VOID === null`, `PI === Math.PI`).
- Proxies bound per-instance in the factories; tests exercise both property and
  list syntax on instantiated values.