## Why

The `Color` class is a fundamental data type in Director MX 2004, used for representing RGB colors. The current implementation in `core.js` is incomplete and may contain AI-hallucinated behavior. This change implements the complete `Color` class with all methods and properties documented in the Director MX 2004 reference.

## What Changes

- Implement `Color` class in `apps/client/src/director/core/color.js`
- Implement Color constructor and properties (red, green, blue)
- Create co-located tests in `apps/client/src/director/core/__tests__/color.test.js`
- Each method/property gets its own spec file with full documentation from the reference

## Capabilities

### New Capabilities
- `director-core-color`: Complete Color class implementation

### Modified Capabilities
None

## Impact

- **Code**: New file `apps/client/src/director/core/color.js`
- **Tests**: New file `apps/client/src/director/core/__tests__/color.test.js`
- **Dependencies**: None (foundational data type)

## Items to Implement

| Item | Type | Lines | Description |
|------|------|-------|-------------|
| color() | method | 13750-13791 | Create new color |
| red | property | - | Red component (0-255) |
| green | property | - | Green component (0-255) |
| blue | property | - | Blue component (0-255) |
