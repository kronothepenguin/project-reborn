## Why

The `SpriteRef` class represents a sprite reference in Director MX 2004. The current implementation in `core.js` is incomplete and may contain AI-hallucinated behavior. This change implements the complete `SpriteRef` class with all properties documented in the Director MX 2004 reference, with each property having its own spec file containing full documentation.

## What Changes

- Implement `SpriteRef` class in `apps/client/src/director/core/sprite-ref.js`
- Implement all SpriteRef properties with full Director MX 2004 documentation
- Create co-located tests in `apps/client/src/director/core/__tests__/sprite-ref.test.js`
- Each property gets its own spec file with full documentation from the reference

## Capabilities

### New Capabilities
- `director-core-sprite-ref`: Complete SpriteRef class implementation with all properties

### Modified Capabilities
None

## Impact

- **Code**: New file `apps/client/src/director/core/sprite-ref.js`
- **Tests**: New file `apps/client/src/director/core/__tests__/sprite-ref.test.js`
- **Dependencies**: `director-core-point`, `director-core-rect`, `director-core-member-ref` (for loc, rect, and member properties)

## Properties to Implement

| Property | Lines | Description |
|----------|-------|-------------|
| num | - | Sprite channel number |
| member | 43001-43073 | Associated member |
| memberNum | - | Member number |
| castLib | - | Cast library number |
| locH | - | Horizontal location |
| locV | - | Vertical location |
| loc | - | Location as Point |
| ink | - | Ink effect |
| blend | 33370-33402 | Blend percentage |
| visible | - | Visibility flag |
| foreColor | - | Foreground color |
| backColor | - | Background color |
| rect | 47341-47365 | Sprite rectangle |
| name | 44407-44436 | Sprite name |
| currentTime | 36271-36309 | Current time for media |
| trackCount | 52274-52295 | Number of tracks |
| trackStartTime | 52431-52452 | Track start time |
| trackStopTime | 52474-52498 | Track stop time |
| trackType | 52554-52585 | Track type |
| volume | 54177-54202 | Volume level |
