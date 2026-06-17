## ADDED Requirements

### Requirement: Point class SHALL be implemented in core/point.js

The `Point` class SHALL be implemented in `apps/client/src/director/core/point.js` with all methods and properties documented in Director MX 2004.

**Source**: `docs/drmx2004_scripting_ref.txt`
**Inventory**: `docs/director-inventory.json`

**File**: `apps/client/src/director/core/point.js`
**Test**: `apps/client/src/director/core/__tests__/point.test.js`

#### Scenario: Point class is importable
- **WHEN** code imports `import { Point } from "../../director/core"`
- **THEN** Point class is available

#### Scenario: Point can be instantiated
- **WHEN** `new Point(100, 200)` is called
- **THEN** returns Point with locH=100, locV=200

### Requirement: Point SHALL have locH and locV properties

Point instances SHALL have `locH` (horizontal) and `locV` (vertical) properties.

#### Scenario: locH returns horizontal coordinate
- **WHEN** `point.locH` is accessed on Point(100, 200)
- **THEN** returns `100`

#### Scenario: locV returns vertical coordinate
- **WHEN** `point.locV` is accessed on Point(100, 200)
- **THEN** returns `200`

#### Scenario: locH can be set
- **WHEN** `point.locH = 150` is executed
- **THEN** horizontal coordinate becomes 150

### Requirement: Point SHALL support numeric index access via Proxy

Point instances SHALL support bracket access syntax `point[n]` where 1=locH, 2=locV.

#### Scenario: Bracket access gets locH
- **WHEN** `point[1]` is accessed on Point(100, 200)
- **THEN** returns `100`

#### Scenario: Bracket access gets locV
- **WHEN** `point[2]` is accessed on Point(100, 200)
- **THEN** returns `200`

### Requirement: Point methods SHALL match Director MX 2004 exactly

Each Point method SHALL behave exactly as documented in Director MX 2004. See individual spec files for full documentation:

- `point.md` - Create new point
- `locH.md` - Horizontal coordinate property
- `locV.md` - Vertical coordinate property

#### Scenario: All methods implemented
- **WHEN** any Point method is called
- **THEN** behavior matches Director MX 2004 documentation exactly
