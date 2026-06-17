## Why

The Director MX 2004 API includes type conversion functions that need to be implemented in the new atomic file structure. The current implementation in `api.js` is incomplete and may contain AI-hallucinated behavior. This change implements all conversion functions with full Director MX 2004 documentation, each in its own file with co-located tests.

## What Changes

- Implement 7 conversion functions in `apps/client/src/director/api/` directory
- Each function gets its own file: `charToNum.js`, `float.js`, `integer.js`, `numToChar.js`, `string.js`, `symbol.js`, `value.js`
- Create co-located tests in `apps/client/src/director/api/__tests__/`
- Each function gets its own spec file with full documentation from the Director MX 2004 reference

## Capabilities

### New Capabilities
- `director-api-conversions`: Complete type conversion function implementations with full Director MX 2004 documentation

### Modified Capabilities
None

## Impact

- **Code**: 7 new files in `apps/client/src/director/api/`
- **Tests**: 7 new test files in `apps/client/src/director/api/__tests__/`
- **Dependencies**: None (pure functions)

## Functions to Implement

| Function | Lines | Description |
|----------|-------|-------------|
| charToNum() | 13309-13357 | Convert character to number |
| float() | 16384-16416 | Convert to float |
| integer() | 19303-19329 | Convert to integer |
| numToChar() | 22342-22399 | Convert number to character |
| string() | 28533-28555 | Convert to string |
| symbol() | 28701-28729 | Convert to symbol |
| value() | 29543-29607 | Parse string to value |
