## Why

The Director MX 2004 API includes list manipulation functions that need to be implemented in the new atomic file structure. The current implementation in `api.js` is incomplete and may contain AI-hallucinated behavior. This change implements all list functions with full Director MX 2004 documentation, each in its own file with co-located tests.

## What Changes

- Implement list manipulation functions in `apps/client/src/director/api/` directory
- Each function gets its own file: `list.js`, `propList.js`, `count.js`, `duplicate.js`, `makeSubList.js`, `union.js`
- Create co-located tests in `apps/client/src/director/api/__tests__/`
- Each function gets its own spec file with full documentation from the Director MX 2004 reference

## Capabilities

### New Capabilities
- `director-api-lists`: Complete list function implementations with full Director MX 2004 documentation

### Modified Capabilities
None

## Impact

- **Code**: 6 new files in `apps/client/src/director/api/`
- **Tests**: 6 new test files in `apps/client/src/director/api/__tests__/`
- **Dependencies**: `director-core-list`, `director-core-proplist` (for list and propList creation)

## Functions to Implement

| Function | Lines | Description |
|----------|-------|-------------|
| list() | 19924-19965 | Create linear list |
| propList() | 24462-24514 | Create property list |
| count() | 14057-14091 | Get list count |
| duplicate() | 15435-15456 | Duplicate list |
| makeSubList() | 20182-20207 | Create sublist |
| union() | 29183-29207 | Union of two lists |
