# Data Model: Director Engine Base

Entities are the five Director data-type classes and the eleven Lingo constants,
each mapping 1:1 to the Director MX 2004 scripting reference (line cites in
research.md R1/R2). Fields below are the contract shape; implementation stays
light — classes with plain fields + documented methods + a bracket proxy where
the docs define list-syntax access. Storage fields are plain public fields per
package canon (AGENTS.md rule 3; plan decision D-1) and are itemized so the
FR-004 surface audit is mechanical.

---

## `Color` — `src/engine/types/color.js`

| Member | Type | Rules |
| --- | --- | --- |
| `red` | number (get/set) | channel; integer 0–255; ALL other values truncated (methods.txt 2219–2220); truncation = `Math.trunc` + clamp to 0/255; enforced on construction AND assignment |
| `green` | number (get/set) | same (2221–2222) |
| `blue` | number (get/set) | same (2223–2224) |
| `_red`/`_green`/`_blue` | number | implementation storage (D-1); underscore-prefixed plain fields; never documented API |

- Constructor: `new Color(red = 0, green = 0, blue = 0)` — omitted/extra
  argument behavior is doc-silent (params marked Required); default 0 recorded
  (D-2 applies by analogy: spec-authorized, harmless, matches current).
- Creation via `color()` creator function: API-006 boundary (not exported from
  `@/lingo` in 002); single-argument palette-index form (`color(137)`, 2199)
  is palette behavior — out of 002 scope.
- Validation: no validation errors — every value truncates to 0–255.
- REMOVED surfaced: `hex`, `rgb`, `equals()` (undocumented; clarify Q1).

## `List` — `src/engine/types/list.js`

| Member | Type | Rules |
| --- | --- | --- |
| `items` | Array | entries storage (D-1); 1-based access only via API/proxy (list() index "begins with 1", 8227–8228) |
| `sorted` | boolean (false) | sorted-state persistence: set true by `sort()`; REMAINS true across add/delete/append/deleteProp (essentials 1764–1765) |
| `count` | number (getter) | `items.length`; "returns the number of entries in a linear or property list" (2498–2513) |
| `add(value)` | method | sorted list → insert at proper position (typed order); unsorted → append (essentials 1699; sort 16609–16610; append 650–652) |
| `addAt(position, value)` | method | 1-based insert at position (223–243) |
| `append(value)` | method | push to end (643–665) |
| `deleteAt(position)` | method | 1-based delete; position < 1 or > count → NO-OP (D-3; docs: Director alert, 3162–3164; spec Edge Cases authorize no-op) |
| `deleteOne(value)` | method | delete first occurrence only; absent → no-op (3394–3417) |
| `deleteProp(position)` | method | same as deleteAt for linear lists (3419–3429) |
| `duplicate()` | method | returns independent copy; nested `List`/`PropList` items deep-copied (3816–3840) |
| `getAt(position)` | method | 1-based read; position < 1 or > count → script error (throw) (5193–5201) |
| `getOne(value)` | method | 1-based position of first occurrence; absent → 0 (5824–5834) |
| `getPos(value)` | method | same as getOne for linear lists; absent → 0 (6057–6067) |
| `getLast()` | method | last value; empty → VOID (`null`) (5613–5630; D-3 for empty case) |
| `setAt(position, value)` | method | replace at 1-based position; position > count → pad blanks with 0 up to position (D-2; 15731–15742) |
| `sort()` | method | alphanumeric, NUMBERS BEFORE STRINGS, strings lexicographic by initial letters (essentials 1759–1761); sets `sorted = true` (16599–16623) |
| `[Symbol.iterator]` | JS protocol | kept (non-Director plumbing; itemized in contract) |

- Bracket access (`theList[2]`) via Proxy: get → `getAt` semantics (out-of-range
  → throw); set → `setAt` semantics (beyond end pads); `n in list` → 1 ≤ n ≤ count.
- List-syntax reads/writes are 1-based — never 0-based (the 0-based `[]`
  literal form is Lingo-syntax-only, 8234–8235, not our surface).
- Reference semantics: assignment copies the reference, not the list
  (essentials 1729–1741) — native JS behavior, no work.

## `PropList` — `src/engine/types/prop-list.js`

| Member | Type | Rules |
| --- | --- | --- |
| `entries` | Array of `{ symbol, value }` | storage (D-1); 1-based indexing via API/proxy (essentials 1517–1518) |
| `sorted` | boolean (false) | sorted-state persistence; sorted BY PROPERTY NAMES (16607–16608; essentials 1762–1765) |
| `count` | number (getter) | entries length |
| `addProp(property, value)` | method | unsorted → append; sorted → insert in property-name order; EXISTING property → duplicate entry created (479–511, esp. 490–492, 507–511) |
| `deleteAt(position)` | method | 1-based delete; absent position → no-op (D-3; 3155–3186) |
| `deleteOne(value)` | method | delete first entry whose VALUE matches (property + value deleted); absent → no-op (3401–3404) |
| `deleteProp(property)` | method | delete FIRST entry with that property name only (3419–3432) |
| `duplicate()` | method | independent copy; nested lists deep-copied (3816) |
| `findPos(property)` | method | 1-based position; absent → VOID (`null`) (4595–4617, esp. 4606; R2: VOID ≡ null) |
| `findPosNear(valueOrProperty)` | method | nearest entry by alphanumeric order (D-4; 4621–4649) |
| `getaProp(property)` | method | value for property; absent → VOID (`null`) (5145–5161) |
| `getAt(position)` | method | value at 1-based position; out-of-range → script error (5193–5201) |
| `getOne(value)` | method | PROPERTY associated with first matching value; absent → 0 (5824–5852) |
| `getPos(value)` | method | 1-based position of first matching value; absent → 0 (6057–6067) |
| `getProp(property)` | method | value for property; absent → script error (6122–6131) |
| `getPropAt(index)` | method | property name at 1-based position; absent → script error (6151–6160) |
| `setaProp(property, newValue)` | method | replace if present; ADD property+value if absent (15682–15696) |
| `setAt(position, value)` | method | replace value at 1-based position; position > count → script error (15731–15740) |
| `sort()` | method | alphabetical by property names; sets `sorted = true` (16599–16608) |

- Bracket/dot access semantics (doc-grounded, proxy rules):
  - READ `pl[#prop]` / `pl["prop"]`: value; missing property → script error
    (note, 5183–5184); integer ≥ 1 → `getAt`.
  - WRITE `pl[#prop] = v` / `pl["prop"] = v`: replace; missing → ADD
    (essentials 1562–1567 — `foodList[#Bruno] = "sushi"` on an empty list).
  - Dot-write `pl.prop = v`: only for EXISTING properties (note, 15725–15726).
  - String keys that collide with class members (`count`, `entries`, method
    names…) resolve as members first — proxy checks class members before
    property lookup.
- Direct `getaProp` function-call spelling returns VOID for missing — the
  bracket-read-throws distinction above is per the docs and is asserted in
  tests.

## `Point` — `src/engine/types/point.js`

| Member | Type | Rules |
| --- | --- | --- |
| `locH` | number (field) | horizontal coordinate; read/write (12017, 12041) |
| `locV` | number (field) | vertical coordinate; read/write (12017, 12043) |

- Constructor `new Point(locH = 0, locV = 0)` — intH/intV documented Required;
  omission default 0 recorded as D-2-style spec-authorized default.
- Bracket access via Proxy: `pt[1]` → `locH`, `pt[2]` → `locV` (spec US1
  scenario 3; operators.txt 520–522 treat point components as list elements).
- NO arithmetic operators in JS: docs explicitly say JS syntax returns NaN for
  point + point (12018–12031). Surfaced-not-implemented: JS rect arithmetic
  (14222–14224) is impossible with JS operators (no overloading) and out of 002
  scope.

## `Rect` — `src/engine/types/rect.js`

| Member | Type | Rules |
| --- | --- | --- |
| `left` | number (field) | distance of left side from the left Stage edge (14240–14241) |
| `top` | number (field) | distance of top side from the top Stage edge (14242–14243) |
| `right` | number (field) | distance of right side from the LEFT Stage edge (14244–14245) |
| `bottom` | number (field) | distance of bottom side from the TOP Stage edge (14246–14247) |

- Constructor `new Rect(left = 0, top = 0, right = 0, bottom = 0)`; omission
  defaults 0 (D-2-style).
- Bracket access via Proxy: `[1]…[4]` → left, top, right, bottom (14225,
  14235). Width/height are CONSUMER-DERIVED per the docs
  (`myRect.right - myRect.left`, `myRect[3] - myRect[1]` — 14234–14235) — no
  `width`/`height` members (properties.txt 9062–9096 applies to
  Image/Member/Sprite, not the data type).

## Lingo Constants — `src/runtime/constants.js`

| Constant | Lingo value | JS value | Doc anchor |
| --- | --- | --- | --- |
| `EMPTY` | empty string | `""` | constants.txt 74–93 |
| `VOID` | VOID | `null` | 346–372 (JS column `null`, 352) |
| `RETURN` | carriage return chr(13) | `"\r"` | 218–250 (string form `\n` in JS, 225) |
| `SPACE` | space chr(32) | `" "` | 252–270 |
| `TAB` | tab chr(9) | `"\t"` | 273–316 ("the character typed is the tab character", 287) |
| `BACKSPACE` | backspace chr(8) | `"\b"` | 44–72; ANSI semantics: properties.txt `key` 10242 |
| `ENTER` | numeric-keypad Enter chr(3) | `"\x03"` | 98–130 ("refers only to Enter on the numeric keypad", 109) |
| `QUOTE` | `"` chr(34) | `'"'` | 190–213 |
| `TRUE` | TRUE (numeric 1) | `true` | 322–344 |
| `FALSE` | FALSE (numeric 0) | `false` | 135–157 |
| `PI` | π | `Math.PI` | 159–184 (JS column `Math.PI`, 165) |

- Numeric coercion contract: `FALSE` is 0 in numeric contexts; `0` is treated as
  FALSE; any nonzero integer evaluates to TRUE (135–157, 322–344) — JS booleans
  already coerce this way; tests assert the documented statements.
- Key constants are compared against `_key.key`, which returns the ANSI
  character (10242) — NOT the keyCode numbers in the constants.txt JS columns
  (51/3/36/49/48). Discrepancy recorded; plan resolves to character semantics.

## Validation rules (consolidated)
- Color channels: every input truncates to integer 0–255 (both args and sets).
- List/PropList indexes are 1-based in command and bracket syntax (0-based
  `[]` literals are Lingo-only).
- Read past the end: `getAt`/bracket → script error (both types, per getAt).
- `PropList` missing property: `getaProp`/`findPos` → VOID (null); `getProp`/
  `getPropAt`/bracket-read → script error; bracket-write → adds; dot-write on
  missing → script error (setaProp note).
- `List.setAt` beyond end pads with 0 (D-2); `PropList.setAt` beyond end →
  script error.
- `deleteAt`/`deleteOne`/`deleteProp` absent targets → no-op (D-3); `deleteProp`
  deletes only the first duplicate.
- `addProp` on an existing property CREATES a duplicate (both syntaxes).
- Absent-value sentinels: `getOne`/`getPos` → 0; `getLast` on empty → VOID
  (null) (D-3).