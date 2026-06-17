## Why

The Director MX 2004 API includes string manipulation functions that need to be implemented in the new atomic file structure. The current implementation in `api.js` is incomplete and may contain AI-hallucinated behavior. This change implements all string functions with full Director MX 2004 documentation, each in its own file with co-located tests.

## What Changes

- Implement string manipulation functions in `apps/client/src/director/api/` directory
- Each function gets its own file: `chars.js`, `length.js`, `offset.js`
- Create co-located tests in `apps/client/src/director/api/__tests__/`
- Each function gets its own spec file with full documentation from the Director MX 2004 reference

## Capabilities

### New Capabilities
- `director-api-strings`: Complete string function implementations with full Director MX 2004 documentation

### Modified Capabilities
None

## Impact

- **Code**: 3 new files in `apps/client/src/director/api/`
- **Tests**: 3 new test files in `apps/client/src/director/api/__tests__/`
- **Dependencies**: None (pure functions)

## Functions to Implement

| Function | Lines | Description |
|----------|-------|-------------|
| chars() | 13266-13308 | Extract substring |
| length() | 19802-19831 | Get string length |
| offset() | 22434-22501 | Find substring position |
