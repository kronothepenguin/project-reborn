## ADDED Requirements

### Requirement: Color class SHALL be implemented in core/color.js

The `Color` class SHALL be implemented in `apps/client/src/director/core/color.js` with all methods and properties documented in Director MX 2004.

**Source**: `docs/drmx2004_scripting_ref.txt`
**Inventory**: `docs/director-inventory.json`

**File**: `apps/client/src/director/core/color.js`
**Test**: `apps/client/src/director/core/__tests__/color.test.js`

#### Scenario: Color class is importable
- **WHEN** code imports `import { Color } from "../../director/core"`
- **THEN** Color class is available

#### Scenario: Color can be instantiated
- **WHEN** `new Color(255, 128, 0)` is called
- **THEN** returns Color with red=255, green=128, blue=0

### Requirement: Color SHALL have red, green, blue properties

Color instances SHALL have `red`, `green`, and `blue` properties (0-255).

#### Scenario: red returns red component
- **WHEN** `color.red` is accessed on Color(255, 128, 0)
- **THEN** returns `255`

#### Scenario: green returns green component
- **WHEN** `color.green` is accessed on Color(255, 128, 0)
- **THEN** returns `128`

#### Scenario: blue returns blue component
- **WHEN** `color.blue` is accessed on Color(255, 128, 0)
- **THEN** returns `0`

### Requirement: Color methods SHALL match Director MX 2004 exactly

Each Color method SHALL behave exactly as documented in Director MX 2004. See individual spec files for full documentation:

- `color.md` - Create new color

#### Scenario: All methods implemented
- **WHEN** any Color method is called
- **THEN** behavior matches Director MX 2004 documentation exactly
