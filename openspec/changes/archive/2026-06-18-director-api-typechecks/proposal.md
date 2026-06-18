## Why

The Director MX 2004 API includes type checking functions that need to be implemented in the new atomic file structure. The current implementation in `api.js` is incomplete and may contain AI-hallucinated behavior. This change implements all type checking functions with full Director MX 2004 documentation, each in its own file with co-located tests.

## What Changes

- Implement 8 type checking functions in `apps/client/src/director/api/` directory
- Each function gets its own file: `floatP.js`, `ilk.js`, `integerP.js`, `listP.js`, `objectP.js`, `stringP.js`, `symbolP.js`, `voidP.js`
- Create co-located tests in `apps/client/src/director/api/__tests__/`
- Each function gets its own spec file with full documentation from the Director MX 2004 reference

## Capabilities

### New Capabilities
- `director-api-typechecks`: Complete type checking function implementations with full Director MX 2004 documentation

### Modified Capabilities
None

## Impact

- **Code**: 8 new files in `apps/client/src/director/api/`
- **Tests**: 8 new test files in `apps/client/src/director/api/__tests__/`
- **Dependencies**: `director-core-list`, `director-core-proplist` (for listP, ilk functions)

## Functions to Implement

| Function | Lines | Description |
|----------|-------|-------------|
| floatP() | 16417-16446 | Check if value is float |
| ilk() | 18644-18891 | Return type symbol |
| integerP() | 19330-19359 | Check if value is integer |
| listP() | 19966-19988 | Check if value is list |
| objectP() | 22400-22433 | Check if value is object |
| stringP() | 28556-28578 | Check if value is string |
| symbolP() | 28730-28751 | Check if value is symbol |
| voidP() | 30146-30168 | Check if value is void |
