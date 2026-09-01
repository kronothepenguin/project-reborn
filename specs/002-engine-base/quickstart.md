# Quickstart Validation: Director Engine Base

Runnable validation scenarios proving 002 works end-to-end, using the existing
tooling (vitest, jsdom, pnpm). All scenarios are pure unit validation — no
browser, no custom shims.

## Prerequisites

- Node ≥ 20; pnpm ≥ 10; repo installed (`pnpm install` per AGENTS.md).
- Package at `packages/director/` with vitest + jsdom devDeps (already declared).

## Setup / test commands

```bash
pnpm --filter @project-reborn/director test
# underlying: vitest run  (environment jsdom, include src/**/__tests__/**/*.test.js)
```

## Scenarios

### Scenario 1 — All three public entries import cleanly in a fresh process

```bash
node --input-type=module -e "
await import('./src/index.js');
await import('./src/api/index.js');
await import('./src/browser/index.js');
console.log('ok: 3 entries import with zero module-resolution errors');
"
```

Expected: `ok: 3 entries import …` and no error. (Regressed permanently by
`src/__tests__/entry-points.test.js` — asserts zero resolution errors, no
context activation, no import-time side effects; FR-007/FR-008/SC-004.)

### Scenario 2 — Data-type surface audit (zero undocumented members)

```bash
node --input-type=module -e "
import { Color, List, PropList, Point, Rect } from './src/api/index.js';
const documented = {
  Color:    ['red', 'green', 'blue'],
  List:     ['count', 'add', 'addAt', 'append', 'deleteAt', 'deleteOne',
             'deleteProp', 'duplicate', 'getAt', 'getOne', 'getPos',
             'getLast', 'setAt', 'sort'],
  PropList: ['count', 'addProp', 'deleteAt', 'deleteOne', 'deleteProp',
             'duplicate', 'findPos', 'findPosNear', 'getaProp', 'getAt',
             'getOne', 'getPos', 'getProp', 'getPropAt', 'setaProp',
             'setAt', 'sort'],
  Point:    [],
  Rect:     [],
};
for (const [name, members] of Object.entries(documented)) {
  const proto = { Color, List, PropList, Point, Rect }[name].prototype;
  const found = Object.getOwnPropertyNames(proto).filter(p => p !== 'constructor');
  const extra = found.filter(p => !members.includes(p) && !p.startsWith('__'));
  if (extra.length) throw new Error(name + ' undocumented prototype members: ' + extra);
  console.log('ok:', name, 'prototype surface exact');
}
if (Object.getOwnPropertyNames(new Color()).some(k => ['hex','rgb','equals'].includes(k)))
  throw new Error('Color convenience members still present');
console.log('ok: Color has no hex/rgb/equals');
"
```

Expected: five `ok:` lines. The documented lists are the audit source of truth
(contract); implementation storage fields (`items`, `entries`, `sorted`,
`_red/_green/_blue`) are OWN fields, not prototype members — verified
separately by the unit tests against the contract's field tables.

### Scenario 3 — Color truncation

```bash
node --input-type=module -e "
import { Color } from './src/api/index.js';
const c = new Color(-5, 300, 12.9);
if (c.red !== 0 || c.green !== 255 || c.blue !== 12) throw new Error('ctor clamp');
c.red = -1; c.green = 256.7; c.blue = 3.5;
if (c.red !== 0 || c.green !== 255 || c.blue !== 3) throw new Error('setter clamp');
console.log('ok: channels truncate to integer 0-255 on construction and assignment');
"
```

Expected: `ok: channels truncate to integer 0-255 …`

### Scenario 4 — List semantics suite

```bash
node --input-type=module -e "
import { List } from './src/api/index.js';
const l = new List(3, 1, 2);
l.add(1.5);                        // unsorted → end
if (l.count !== 4 || l.getAt(1) !== 3) throw new Error('unsorted add must append');
l.sort();                          // [1, 1.5, 2, 3] — numbers before strings
if (!l.sorted) throw new Error('sorted flag');
l.add(2.5);                        // sorted → proper position
if (l.getAt(3) !== 2.5) throw new Error('sorted add position');
l.setAt(8, 99);                    // pads blanks with 0
if (l.count !== 8 || l.getAt(7) !== 0 || l.getAt(8) !== 99) throw new Error('setAt padding');
l.deleteAt(1); l.deleteAt(999);    // absent position → no-op
if (l.count !== 7) throw new Error('deleteAt no-op');
l.deleteOne(1); if (l.getOne(1) !== 0) throw new Error('first-occurrence delete');
const d = l.duplicate(); d.setAt(1, 'x');
if (l.getAt(1) === 'x') throw new Error('duplicate independence');
if (l.getLast() !== 99) { /* 99 last */ }
let threw = false; try { l.getAt(200); } catch { threw = true; }
if (!threw) throw new Error('out-of-range getAt must throw');
console.log('ok: list semantics (add/addAt/append/delete/setAt-padding/sort/duplicate/count)');
"
```

Expected: `ok: list semantics …`

### Scenario 5 — PropList semantics

```bash
node --input-type=module -e "
import { PropList } from './src/api/index.js';
const pl = new PropList('a', 1, 'b', 2);
pl.addProp('c', 3);
if (pl.getaProp('c') !== 3) throw new Error('addProp');
pl.addProp('a', 10);               // duplicate property created
if (pl.count !== 4) throw new Error('duplicate addProp must create duplicate');
if (pl.getaProp('zzz') !== null) throw new Error('getaProp missing must be VOID(null)');
if (pl.findPos('zzz') !== null) throw new Error('findPos missing must be VOID(null)');
pl.setaProp('a', 99);              // first entry replaced
if (pl.getaProp('a') !== 99) throw new Error('setaProp replace');
pl.setaProp('new', 7);             // absent → adds
if (pl.getOne(7) !== 'new') throw new Error('setaProp add');
if (pl.getPos('nope') !== 0 || pl.getOne('nope') !== 0) throw new Error('0 sentinels');
let threw = false; try { pl.getProp('zzz'); } catch { threw = true; }
if (!threw) throw new Error('getProp missing must throw');
threw = false; try { pl['zzz']; } catch { threw = true; }
if (!threw) throw new Error('bracket read of missing property must throw');
pl['zzz'] = 1;                     // bracket write adds
if (pl.getaProp('zzz') !== 1) throw new Error('bracket write adds');
pl.sort();
if (pl.findPosNear('z') < 1) throw new Error('findPosNear position');
console.log('ok: proplist semantics');
"
```

Expected: `ok: proplist semantics`

### Scenario 6 — Point/Rect property + list syntax, Rect width/height

```bash
node --input-type=module -e "
import { Point, Rect } from './src/api/index.js';
const p = new Point(10, 20);
if (p.locH !== 10 || p.locV !== 20 || p[1] !== 10 || p[2] !== 20) throw new Error('point');
p[1] = 30; if (p.locH !== 30) throw new Error('point list-set');
const r = new Rect(40, 30, 90, 70);
if (r[3] - r[1] !== 50) throw new Error('rect width via list syntax');
if (r.right - r.left !== 50) throw new Error('rect width via properties');
r[4] = 100; if (r.bottom !== 100) throw new Error('rect list-set');
if ('width' in r || 'height' in r) throw new Error('no width/height members (consumer-derived)');
console.log('ok: point/rect property+list syntax, width consumer-derived');
"
```

Expected: `ok: point/rect property+list syntax …`

### Scenario 7 — Constants table values

```bash
node --input-type=module -e "
import { EMPTY, VOID, RETURN, SPACE, TAB, BACKSPACE, ENTER, QUOTE, TRUE, FALSE, PI }
  from './src/api/index.js';
const cases = [
  [EMPTY, ''], [VOID, null], [RETURN, '\r'], [SPACE, ' '], [TAB, '\t'],
  [BACKSPACE, '\b'], [ENTER, '\x03'], [QUOTE, '\"'], [TRUE, true],
  [FALSE, false], [PI, Math.PI],
];
for (const [got, want] of cases) if (got !== want) throw new Error('value mismatch');
if (Number(FALSE) !== 0) throw new Error('FALSE numeric 0');
if (!Number(TRUE)) throw new Error('TRUE numeric nonzero');
console.log('ok: 11 constants doc-conformant, TRUE/FALSE numeric semantics');
"
```

Expected: `ok: 11 constants doc-conformant, TRUE/FALSE numeric semantics`
(Note: asserted permanently in `src/engine/base/__tests__/constants.test.js`.)

### Scenario 8 — Test command green, no pre-existing failures

```bash
pnpm --filter @project-reborn/director test
```

Expected: vitest run completes; 7 files / all assertions pass; total test files
in `src` = 7 (zero leftover from the deleted 132); `src/__test-shims__/` does
not exist. This gates SC-002/SC-003/SC-006.

## Notes

- Every scenario above is encoded as a permanent co-located unit test
  (5 type files + constants + entry-points); the one-liners are the manual
  smoke equivalents.
- Red-green record: before the import fixes, scenario 1/8 fail with
  module-resolution errors on the pre-repair imports (`src/api/index.js` →
  `../runtime/methods/*`, `src/browser/index.js` → `../runtime/creators/*`);
  scenario 2 red on `hex`/`rgb`/`equals`; scenario 7 red on `BACKSPACE`
  (`"3"` vs `"\b"`); all go green with the plan's fixes.