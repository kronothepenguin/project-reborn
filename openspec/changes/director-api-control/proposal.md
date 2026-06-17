## Why

The Director MX 2004 API includes control flow functions that need to be implemented in the new atomic file structure. The current implementation in `api.js` is incomplete and may contain AI-hallucinated behavior. This change implements all control functions with full Director MX 2004 documentation, each in its own file with co-located tests.

## What Changes

- Implement control functions in `apps/client/src/director/api/` directory
- Each function gets its own file: `abort.js`, `go.js`, `halt.js`, `quit.js`, `stopEvent.js`
- Create co-located tests in `apps/client/src/director/api/__tests__/`
- Each function gets its own spec file with full documentation from the Director MX 2004 reference

## Capabilities

### New Capabilities
- `director-api-control`: Complete control function implementations with full Director MX 2004 documentation

### Modified Capabilities
None

## Impact

- **Code**: 5 new files in `apps/client/src/director/api/`
- **Tests**: 5 new test files in `apps/client/src/director/api/__tests__/`
- **Dependencies**: `director-core-movie-ref` (for go, halt, quit)

## Functions to Implement

| Function | Lines | Description |
|----------|-------|-------------|
| abort | 11737-11766 | Abort current handler |
| go() | 17971-18040 | Go to frame |
| halt() | 18259-18290 | Halt movie playback |
| quit() | 25227-25258 | Quit application |
| stopEvent() | 28419-28470 | Stop event propagation |
