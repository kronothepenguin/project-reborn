## Why

The Director MX 2004 API includes bitwise operation functions that need to be implemented in the new atomic file structure. The current implementation in `api.js` is incomplete and may contain AI-hallucinated behavior. This change implements all bitwise functions with full Director MX 2004 documentation, each in its own file with co-located tests.

## What Changes

- Implement bitwise functions in `apps/client/src/director/api/` directory
- Each function gets its own file: `bitAnd.js`, `bitNot.js`, `bitOr.js`, `bitXor.js`
- Create co-located tests in `apps/client/src/director/api/__tests__/`
- Each function gets its own spec file with full documentation from the Director MX 2004 reference

## Capabilities

### New Capabilities
- `director-api-bitwise`: Complete bitwise function implementations with full Director MX 2004 documentation

### Modified Capabilities
None

## Impact

- **Code**: 4 new files in `apps/client/src/director/api/`
- **Tests**: 4 new test files in `apps/client/src/director/api/__tests__/`
- **Dependencies**: None (pure functions)

## Functions to Implement

| Function | Lines | Description |
|----------|-------|-------------|
| bitAnd() | 12498-12539 | Bitwise AND |
| bitNot() | 12540-12573 | Bitwise NOT |
| bitOr() | 12574-12615 | Bitwise OR |
| bitXor() | 12616-12657 | Bitwise XOR |
