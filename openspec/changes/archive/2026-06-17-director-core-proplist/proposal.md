## Why

The `PropList` class is a fundamental data type in Director MX 2004, used for storing key-value pairs where keys are symbols. The current implementation in `core.js` is incomplete and may contain AI-hallucinated behavior. This change implements the complete `PropList` class with all methods documented in the Director MX 2004 reference, with each method having its own spec file containing full documentation.

## What Changes

- Implement `PropList` class in `apps/client/src/director/core/prop-list.js`
- Implement all 16 PropList-specific methods with full Director MX 2004 documentation
- Create co-located tests in `apps/client/src/director/core/__tests__/prop-list.test.js`
- Each method gets its own spec file with full documentation from the reference

## Capabilities

### New Capabilities
- `director-core-proplist`: Complete PropList class implementation with all methods

### Modified Capabilities
None

## Impact

- **Code**: New file `apps/client/src/director/core/prop-list.js`
- **Tests**: New file `apps/client/src/director/core/__tests__/prop-list.test.js`
- **Dependencies**: `director-core-list` (PropList shares some list-like behavior)

## Methods to Implement

| Method | Lines | Description |
|--------|-------|-------------|
| addProp | 12152-12187 | Add property/value pair |
| count | 14057-14091 | Get proplist count |
| deleteAt | 14814-14847 | Delete item at position |
| deleteOne | 15034-15056 | Delete first occurrence of value |
| deleteProp | 15057-15087 | Delete property by symbol |
| duplicate | 15435-15456 | Duplicate proplist |
| findPos | 16259-16281 | Find position of property |
| findPosNear | 16282-16311 | Find nearest position |
| getaProp | 16768-16814 | Get property by symbol |
| getAt | 16815-16875 | Get item at position |
| getOne | 17439-17467 | Get position of value |
| getPos | 17671-17696 | Get position of value |
| getProp | 17728-17754 | Get property (throws if not found) |
| getPropAt | 17755-17773 | Get property at index |
| setaProp | 27136-27185 | Set property by symbol |
| setAt | 27186-27226 | Set item at position |
| sort | 27985-28009 | Sort proplist |
| propList() | 24462-24514 | Create new proplist |
