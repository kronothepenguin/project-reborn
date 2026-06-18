## Why

The Director MX 2004 API includes sound functions that need to be implemented in the new atomic file structure. The current implementation in `api.js` is incomplete and may contain AI-hallucinated behavior. This change implements all sound functions with full Director MX 2004 documentation, each in its own file with co-located tests.

## What Changes

- Implement sound functions in `apps/client/src/director/api/` directory
- Each function gets its own file: `beep.js`, `sound.js`
- Create co-located tests in `apps/client/src/director/api/__tests__/`
- Each function gets its own spec file with full documentation from the Director MX 2004 reference

## Capabilities

### New Capabilities
- `director-api-sound`: Complete sound function implementations with full Director MX 2004 documentation

### Modified Capabilities
None

## Impact

- **Code**: 2 new files in `apps/client/src/director/api/`
- **Tests**: 2 new test files in `apps/client/src/director/api/__tests__/`
- **Dependencies**: `director-core-sound-ref` (for beep)

## Functions to Implement

| Function | Lines | Description |
|----------|-------|-------------|
| beep() | 12396-12430 | Play system beep |
| sound() | 28010-28038 | Access sound channel |
