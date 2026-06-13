# Director Runtime Testing Guide

## Overview

The Director runtime (`apps/client/src/director/`) has a comprehensive test suite using **vitest** with **jsdom** environment. Tests verify behavior against the Director MX 2004 reference documentation.

**Reference Document**: `docs/drmx2004_scripting_ref.txt`

## Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test -- --watch

# Run specific test file
pnpm test -- --run src/director/__tests__/math.test.js

# Run tests matching pattern
pnpm test -- --run -t "abs"
```

## Test Structure

Tests are organized in `src/director/__tests__/`:

| File | Description |
|------|-------------|
| `constants.test.js` | VOID, EMPTY, PI, RETURN, SPACE, TAB, QUOTE |
| `math.test.js` | abs, sqrt, max, min, power, sin, cos, tan, atan, log, random |
| `typechecks.test.js` | voidP, integerP, floatP, listP, objectP, stringP, symbolP, ilk |
| `list-operations.test.js` | list, getAt, union, makeSubList, List methods |
| `proplist-operations.test.js` | propList, getProp, getPropAt, findPos, PropList methods |
| `string-operations.test.js` | numToChar, charToNum, contains, starts, chars, offset, length |
| `conversions.test.js` | integer, float, string, value, symbol |
| `instance-creation.test.js` | newFn, rawNew |
| `network.test.js` | netAbort, netDone, netError, netTextResult, netLastModDate, netMIME |
| `sound.test.js` | soundBusy, playSound, queueSound |
| `window-stage.test.js` | updateStage, moveToFront, moveToBack |
| `cast-media.test.js` | newMember, unLoadMember, preLoadMember, resetCastLibs |
| `datetime.test.js` | date, time |
| `misc.test.js` | halt, quit, bitNot, bitAnd, bitOr, bitXor |
| `the-proxy-high.test.js` | High-priority `the` properties |
| `the-proxy-medium.test.js` | Medium-priority `the` properties |
| `the-proxy-low.test.js` | Low-priority `the` properties |
| `the-proxy-existing.test.js` | Existing `the` properties |
| `plugin-*.test.js` | Plugin integration tests |

## Director MX 2004 Reference

Tests are based on the Director MX 2004 scripting reference. Key references:

- **Math functions**: Director uses 1-indexed arrays and lists
- **Type checking**: Functions end with `P` (e.g., `voidP`, `integerP`)
- **List operations**: 1-indexed positions (first element is at position 1)
- **String operations**: 1-indexed positions for `chars()`, `offset()`
- **The proxy**: `the.keyCode`, `the.mouseH`, etc. map to underlying objects

## Naming Conventions

| Lingo | JavaScript | Notes |
|-------|-----------|-------|
| `voidp` | `voidP` / `voidp` | Both exported for compatibility |
| `new` | `newFn` | JS reserved word |
| `delete` | `deleteFn` | JS reserved word |

## Bug Fixes Discovered by Tests

The test suite discovered and helped fix several bugs:

1. **List.getAt()**: Had inverted bounds check condition
2. **List.addAt()**: Was setting instead of inserting
3. **List proxy**: Symbol.iterator was not handled correctly
4. **PropList proxy**: Methods were not accessible through proxy
5. **Member class**: Missing constructor for type/name parameters
6. **createIndexedRegistry**: Numeric index set handler was broken
7. **the proxy**: Missing handlers for frame, mouseV, mouseH

## Adding New Tests

1. Create test file in `__tests__/` directory
2. Import functions from `../api.js` or `../index.js`
3. Use `describe`/`it` blocks matching Director reference sections
4. Include Director MX 2004 reference comments where applicable
5. Run `pnpm test` to verify

## Example Test

```javascript
import { describe, it, expect } from "vitest";
import { abs } from "../api.js";

describe("Director Math Functions", () => {
  describe("abs()", () => {
    it("returns absolute value for negative numbers", () => {
      // Director MX 2004: abs(-42) returns 42
      expect(abs(-42)).toBe(42);
    });
  });
});
```
