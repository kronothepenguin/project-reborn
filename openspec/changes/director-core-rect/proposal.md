## Why

The `Rect` class is a fundamental data type in Director MX 2004, used for representing rectangles with left, top, right, and bottom coordinates. The current implementation in `core.js` is incomplete and may contain AI-hallucinated behavior. This change implements the complete `Rect` class with all methods and properties documented in the Director MX 2004 reference.

## What Changes

- Implement `Rect` class in `apps/client/src/director/core/rect.js`
- Implement Rect constructor and properties (left, top, right, bottom)
- Create co-located tests in `apps/client/src/director/core/__tests__/rect.test.js`
- Each method/property gets its own spec file with full documentation from the reference

## Capabilities

### New Capabilities
- `director-core-rect`: Complete Rect class implementation

### Modified Capabilities
None

## Impact

- **Code**: New file `apps/client/src/director/core/rect.js`
- **Tests**: New file `apps/client/src/director/core/__tests__/rect.test.js`
- **Dependencies**: None (foundational data type)

## Items to Implement

| Item | Type | Lines | Description |
|------|------|-------|-------------|
| rect() | method | 25756-25827 | Create new rect |
| left | property | - | Left edge coordinate |
| top | property | - | Top edge coordinate |
| right | property | - | Right edge coordinate |
| bottom | property | - | Bottom edge coordinate |
