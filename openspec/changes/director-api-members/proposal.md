## Why

The Director MX 2004 API includes member and object access functions that need to be implemented in the new atomic file structure. The current implementation in `api.js` is incomplete and may contain AI-hallucinated behavior. This change implements all member access functions with full Director MX 2004 documentation, each in its own file with co-located tests.

## What Changes

- Implement member access functions in `apps/client/src/director/api/` directory
- Each function gets its own file: `member.js`, `sprite.js`, `castLib.js`, `script.js`, `point.js`, `rect.js`, `color.js`
- Create co-located tests in `apps/client/src/director/api/__tests__/`
- Each function gets its own spec file with full documentation from the Director MX 2004 reference

## Capabilities

### New Capabilities
- `director-api-members`: Complete member access function implementations with full Director MX 2004 documentation

### Modified Capabilities
None

## Impact

- **Code**: 7 new files in `apps/client/src/director/api/`
- **Tests**: 7 new test files in `apps/client/src/director/api/__tests__/`
- **Dependencies**: `director-core-member-ref`, `director-core-sprite-ref`, `director-core-cast-library-ref`, `director-core-point`, `director-core-rect`, `director-core-color`

## Functions to Implement

| Function | Lines | Description |
|----------|-------|-------------|
| member() | 20436-20482 | Access cast member |
| sprite() | 28039-28063 | Access sprite |
| castLib() | 13143-13172 | Access cast library |
| script() | 26746-26783 | Access script |
| point() | 23523-23581 | Create point |
| rect() | 25756-25827 | Create rect |
| color() | 13750-13791 | Create color |
