## Why

The `List` class is a fundamental data type in Director MX 2004, used for storing ordered collections of values. The current implementation in `core.js` is incomplete and may contain AI-hallucinated behavior. This change implements the complete `List` class with all methods documented in the Director MX 2004 reference, with each method having its own spec file containing full documentation.

## What Changes

- Implement `List` class in `apps/client/src/director/core/list.js`
- Implement all 15 List-specific methods with full Director MX 2004 documentation
- Create co-located tests in `apps/client/src/director/core/__tests__/list.test.js`
- Each method gets its own spec file with full documentation from the reference

## Capabilities

### New Capabilities
- `director-core-list`: Complete List class implementation with all methods

### Modified Capabilities
None

## Impact

- **Code**: New file `apps/client/src/director/core/list.js`
- **Tests**: New file `apps/client/src/director/core/__tests__/list.test.js`
- **Dependencies**: None (foundational data type)

## Methods to Implement

| Method | Lines | Description |
|--------|-------|-------------|
| add | 11854-11889 | Add value to list |
| addAt | 11922-11945 | Insert value at position |
| append | 12300-12325 | Append value to end |
| count | 14057-14091 | Get list count |
| deleteAt | 14814-14847 | Delete item at position |
| deleteOne | 15034-15056 | Delete first occurrence of value |
| deleteProp | 15057-15087 | Delete property at index |
| duplicate | 15435-15456 | Duplicate list |
| getAt | 16815-16875 | Get item at position |
| getOne | 17439-17467 | Get position of value |
| getPos | 17671-17696 | Get position of value |
| getLast | 17236-17254 | Get last item |
| setAt | 27186-27226 | Set item at position |
| sort | 27985-28009 | Sort list |
| list() | 19924-19965 | Create new list |
