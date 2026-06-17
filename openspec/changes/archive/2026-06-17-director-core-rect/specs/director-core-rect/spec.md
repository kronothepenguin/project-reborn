## ADDED Requirements

### Requirement: Rect class SHALL be implemented in core/rect.js

The `Rect` class SHALL be implemented in `apps/client/src/director/core/rect.js` with all methods and properties documented in Director MX 2004.

**Source**: `docs/drmx2004_scripting_ref.txt`
**Inventory**: `docs/director-inventory.json`

**File**: `apps/client/src/director/core/rect.js`
**Test**: `apps/client/src/director/core/__tests__/rect.test.js`

#### Scenario: Rect class is importable
- **WHEN** code imports `import { Rect } from "../../director/core"`
- **THEN** Rect class is available

#### Scenario: Rect can be instantiated
- **WHEN** `new Rect(10, 20, 100, 200)` is called
- **THEN** returns Rect with left=10, top=20, right=100, bottom=200

### Requirement: Rect SHALL have left, top, right, bottom properties

Rect instances SHALL have `left`, `top`, `right`, and `bottom` properties.

#### Scenario: left returns left edge
- **WHEN** `rect.left` is accessed on Rect(10, 20, 100, 200)
- **THEN** returns `10`

#### Scenario: top returns top edge
- **WHEN** `rect.top` is accessed on Rect(10, 20, 100, 200)
- **THEN** returns `20`

#### Scenario: right returns right edge
- **WHEN** `rect.right` is accessed on Rect(10, 20, 100, 200)
- **THEN** returns `100`

#### Scenario: bottom returns bottom edge
- **WHEN** `rect.bottom` is accessed on Rect(10, 20, 100, 200)
- **THEN** returns `200`

### Requirement: Rect SHALL support numeric index access via Proxy

Rect instances SHALL support bracket access syntax `rect[n]` where 1=left, 2=top, 3=right, 4=bottom.

#### Scenario: Bracket access gets left
- **WHEN** `rect[1]` is accessed on Rect(10, 20, 100, 200)
- **THEN** returns `10`

#### Scenario: Bracket access gets top
- **WHEN** `rect[2]` is accessed on Rect(10, 20, 100, 200)
- **THEN** returns `20`

#### Scenario: Bracket access gets right
- **WHEN** `rect[3]` is accessed on Rect(10, 20, 100, 200)
- **THEN** returns `100`

#### Scenario: Bracket access gets bottom
- **WHEN** `rect[4]` is accessed on Rect(10, 20, 100, 200)
- **THEN** returns `200`

### Requirement: Rect methods SHALL match Director MX 2004 exactly

Each Rect method SHALL behave exactly as documented in Director MX 2004. See individual spec files for full documentation:

- `rect.md` - Create new rect

#### Scenario: All methods implemented
- **WHEN** any Rect method is called
- **THEN** behavior matches Director MX 2004 documentation exactly
