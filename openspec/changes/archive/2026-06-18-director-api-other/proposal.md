## Why

The Director MX 2004 API includes many general-purpose functions that need to be implemented in the new atomic file structure. The current implementation in `api.js` is incomplete and may contain AI-hallucinated behavior. This change implements remaining general functions with full Director MX 2004 documentation, each in its own file with co-located tests.

## What Changes

- Implement remaining general functions in `apps/client/src/director/api/` directory
- Each function gets its own file
- Create co-located tests in `apps/client/src/director/api/__tests__/`
- Each function gets its own spec file with full documentation from the Director MX 2004 reference

## Capabilities

### New Capabilities
- `director-api-other`: Complete remaining function implementations with full Director MX 2004 documentation

### Modified Capabilities
None

## Impact

- **Code**: ~311 new files in `apps/client/src/director/api/`
- **Tests**: ~311 new test files in `apps/client/src/director/api/__tests__/`
- **Dependencies**: Various core classes depending on function

## Functions to Implement

This change covers all remaining functions in the `general` category that haven't been covered by other API changes. These include:

- Alert/dialog functions (alert, etc.)
- Application control functions (appMinimize, etc.)
- Browser functions (browserName, etc.)
- Cache functions (cacheSize, clearCache, etc.)
- Call functions (call, callAncestor, callFrame, etc.)
- Camera functions (camera, etc.)
- Recording functions (beginRecording, etc.)
- And many more...

**Note**: This is a large change with ~311 functions. Each function will have its own spec file with full Director MX 2004 documentation.
