## Why

The Director `the` keyword provides access to system properties like `the frame`, `the mouseH`, `the stage`, etc. The current implementation in `syntax.js` is incomplete and needs to be split into atomic files with full documentation. This change implements the complete `the` proxy with all properties documented in Director MX 2004.

## What Changes

- Implement `the` proxy in `apps/client/src/director/syntax/the-proxy.js`
- Implement all `the.*` properties with full Director MX 2004 documentation
- Create co-located tests in `apps/client/src/director/syntax/__tests__/`
- Each property gets its own spec file with full documentation from the Director MX 2004 reference

## Capabilities

### New Capabilities
- `director-syntax-the`: Complete `the` proxy implementation with all system properties

### Modified Capabilities
None

## Impact

- **Code**: New file `apps/client/src/director/syntax/the-proxy.js`
- **Tests**: New test file `apps/client/src/director/syntax/__tests__/the-proxy.test.js`
- **Dependencies**: All core Ref classes (MovieRef, PlayerRef, etc.)

## Properties to Implement

The `the` proxy provides access to ~40+ system properties including:
- `the frame` - Current frame number
- `the mouseH`, `the mouseV` - Mouse coordinates
- `the stage` - Stage dimensions
- `the keyCode` - Last key code
- `the time` - Current time
- And many more...
