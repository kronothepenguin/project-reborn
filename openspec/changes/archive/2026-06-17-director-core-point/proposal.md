## Why

The `Point` class is a fundamental data type in Director MX 2004, used for representing 2D coordinates. The current implementation in `core.js` is incomplete and may contain AI-hallucinated behavior. This change implements the complete `Point` class with all methods and properties documented in the Director MX 2004 reference.

## What Changes

- Implement `Point` class in `apps/client/src/director/core/point.js`
- Implement Point constructor and properties (locH, locV)
- Implement Point methods (inside)
- Create co-located tests in `apps/client/src/director/core/__tests__/point.test.js`
- Each method/property gets its own spec file with full documentation from the reference

## Capabilities

### New Capabilities
- `director-core-point`: Complete Point class implementation

### Modified Capabilities
None

## Impact

- **Code**: New file `apps/client/src/director/core/point.js`
- **Tests**: New file `apps/client/src/director/core/__tests__/point.test.js`
- **Dependencies**: None (foundational data type)

## Items to Implement

| Item | Type | Lines | Description |
|------|------|-------|-------------|
| point() | method | 23523-23581 | Create new point |
| locH | property | 42096-42121 | Horizontal coordinate |
| locV | property | 42149-42174 | Vertical coordinate |
| inside() | method | - | Check if point is inside rect |
